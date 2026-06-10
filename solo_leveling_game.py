import pygame
import random
import sys

# --- 配置常量 ---
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

# 颜色定义 (RGB)
COLOR_BLACK = (0, 0, 0)
COLOR_WHITE = (255, 255, 255)
COLOR_BLUE = (0, 100, 255)      # 系统界面蓝
COLOR_RED = (200, 50, 50)       # 敌人红
COLOR_GREEN = (50, 200, 50)     # 玩家绿
COLOR_GOLD = (255, 215, 0)      # 稀有物品/升级
COLOR_GRAY = (100, 100, 100)

# 等级阈值 (简化版)
LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000]
RANKS = ["E", "D", "C", "B", "A", "S", "SS", "SSS"]

class Player:
    def __init__(self):
        self.x = SCREEN_WIDTH // 2
        self.y = SCREEN_HEIGHT // 2
        self.size = 30
        self.speed = 5
        self.color = COLOR_GREEN
        
        # 属性
        self.level = 1
        self.exp = 0
        self.max_exp = LEVEL_THRESHOLDS[0]
        self.hp = 100
        self.max_hp = 100
        self.strength = 10
        self.agility = 10
        self.sense = 10
        
        # 状态
        self.rank = "E"
        self.title = "狼獾"
        self.stat_points = 0
        self.gold = 0
        
        # 任务状态
        self.daily_quest_completed = False
        self.daily_progress = {"pushups": 0, "squats": 0, "running": 0}
        self.daily_target = 100

    def gain_exp(self, amount):
        self.exp += amount
        if self.exp >= self.max_exp and self.level < len(LEVEL_THRESHOLDS):
            self.level_up()

    def level_up(self):
        self.level += 1
        self.exp -= self.max_exp
        if self.level < len(LEVEL_THRESHOLDS):
            self.max_exp = LEVEL_THRESHOLDS[self.level - 1]
        else:
            self.max_exp = int(self.max_exp * 1.5) # 无限成长
            
        self.stat_points += 3
        self.max_hp += 20
        self.hp = self.max_hp
        self.strength += 2
        self.agility += 2
        self.sense += 2
        
        # 更新 Rank
        if self.level <= 10: self.rank = "E"
        elif self.level <= 20: self.rank = "D"
        elif self.level <= 30: self.rank = "C"
        elif self.level <= 40: self.rank = "B"
        elif self.level <= 50: self.rank = "A"
        elif self.level <= 60: self.rank = "S"
        elif self.level <= 70: self.rank = "SS"
        else: self.rank = "SSS"

    def draw(self, surface):
        pygame.draw.rect(surface, self.color, (self.x, self.y, self.size, self.size))
        # 血条
        hp_ratio = self.hp / self.max_hp
        pygame.draw.rect(surface, COLOR_RED, (self.x, self.y - 10, self.size, 5))
        pygame.draw.rect(surface, COLOR_GREEN, (self.x, self.y - 10, self.size * hp_ratio, 5))

    def update_stats_display(self, font_small):
        return [
            f"Level: {self.level} [{self.rank}]",
            f"EXP: {self.exp}/{self.max_exp}",
            f"HP: {self.hp}/{self.max_hp}",
            f"STR: {self.strength} | AGI: {self.agility} | SEN: {self.sense}",
            f"Stat Points: {self.stat_points}",
            f"Gold: {self.gold}"
        ]

class Enemy:
    def __init__(self, player_level):
        self.size = 30
        self.x = random.randint(0, SCREEN_WIDTH - self.size)
        self.y = random.randint(0, SCREEN_HEIGHT - self.size)
        self.speed = random.randint(2, 4) + (player_level // 5)
        self.hp = 20 + (player_level * 10)
        self.max_hp = self.hp
        self.damage = 5 + (player_level * 2)
        self.exp_reward = 15 + (player_level * 5)
        self.color = COLOR_RED
        self.name = random.choice(["Magic Beetle", "Goblin", "Ice Bear", "Knight Killer"])

    def move_towards(self, player_x, player_y):
        if self.x < player_x: self.x += self.speed
        if self.x > player_x: self.x -= self.speed
        if self.y < player_y: self.y += self.speed
        if self.y > player_y: self.y -= self.speed

    def draw(self, surface):
        pygame.draw.rect(surface, self.color, (self.x, self.y, self.size, self.size))
        # 简单血条
        hp_ratio = max(0, self.hp / self.max_hp)
        pygame.draw.rect(surface, COLOR_WHITE, (self.x, self.y - 8, self.size, 4))
        pygame.draw.rect(surface, COLOR_RED, (self.x, self.y - 8, self.size * hp_ratio, 4))

class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Solo Leveling: System Awakening")
        self.clock = pygame.time.Clock()
        self.font_large = pygame.font.SysFont('Arial', 32, bold=True)
        self.font_small = pygame.font.SysFont('Arial', 18)
        
        self.player = Player()
        self.enemies = []
        self.spawn_timer = 0
        self.game_state = "PLAYING" # PLAYING, SYSTEM_WINDOW, GAME_OVER
        self.message_log = ["System: Welcome, Player.", "System: Complete daily quests to grow."]
        self.shake_time = 0

    def log_message(self, msg):
        self.message_log.insert(0, msg)
        if len(self.message_log) > 5:
            self.message_log.pop()

    def spawn_enemy(self):
        if len(self.enemies) < 3 + (self.player.level // 5):
            self.enemies.append(Enemy(self.player.level))

    def handle_input(self):
        keys = pygame.key.get_pressed()
        if self.game_state == "PLAYING":
            if keys[pygame.K_LEFT] and self.player.x > 0: self.player.x -= self.player.speed
            if keys[pygame.K_RIGHT] and self.player.x < SCREEN_WIDTH - self.player.size: self.player.x += self.player.speed
            if keys[pygame.K_UP] and self.player.y > 0: self.player.y -= self.player.speed
            if keys[pygame.K_DOWN] and self.player.y < SCREEN_HEIGHT - self.player.size: self.player.y += self.player.speed
            
            # 模拟攻击 (按空格)
            if keys[pygame.K_SPACE]:
                self.perform_attack()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if self.game_state == "PLAYING":
                        self.game_state = "SYSTEM_WINDOW"
                    elif self.game_state == "SYSTEM_WINDOW":
                        self.game_state = "PLAYING"
                
                # 在系统界面分配点数
                if self.game_state == "SYSTEM_WINDOW":
                    if event.key == pygame.K_1 and self.player.stat_points > 0:
                        self.player.strength += 1; self.player.stat_points -= 1
                    if event.key == pygame.K_2 and self.player.stat_points > 0:
                        self.player.agility += 1; self.player.stat_points -= 1
                    if event.key == pygame.K_3 and self.player.stat_points > 0:
                        self.player.sense += 1; self.player.stat_points -= 1
                    
                    # 完成任务模拟
                    if event.key == pygame.K_q and not self.player.daily_quest_completed:
                        self.player.daily_progress["pushups"] = self.player.daily_target
                        self.log_message("System: Daily Quest Part 1 Completed.")
                    if event.key == pygame.K_w and not self.player.daily_quest_completed:
                        self.player.daily_progress["squats"] = self.player.daily_target
                        self.log_message("System: Daily Quest Part 2 Completed.")
                    if event.key == pygame.K_e and not self.player.daily_quest_completed:
                        self.player.daily_progress["running"] = self.player.daily_target
                        if all(v >= self.player.daily_target for v in self.player.daily_progress.values()):
                            self.player.daily_quest_completed = True
                            self.player.gain_exp(500)
                            self.player.gold += 1000
                            self.log_message("System: DAILY QUEST COMPLETED! Reward Received.")

        return True

    def perform_attack(self):
        # 简单的范围攻击检测
        attack_rect = pygame.Rect(self.player.x - 40, self.player.y - 40, 110, 110)
        hit = False
        for enemy in self.enemies[:]:
            enemy_rect = pygame.Rect(enemy.x, enemy.y, enemy.size, enemy.size)
            if attack_rect.colliderect(enemy_rect):
                damage = max(1, self.player.strength - 2) # 简单防御计算
                enemy.hp -= damage
                hit = True
                self.shake_time = 5
                if enemy.hp <= 0:
                    self.player.gain_exp(enemy.exp_reward)
                    self.player.gold += random.randint(10, 50)
                    self.enemies.remove(enemy)
                    self.log_message(f"Defeated {enemy.name}! +{enemy.exp_reward} EXP")
        
        if hit:
            # 攻击特效音效占位
            pass

    def update(self):
        if self.game_state != "PLAYING":
            return

        # 生成敌人
        self.spawn_timer += 1
        if self.spawn_timer > 120: # 每2秒尝试生成
            self.spawn_enemy()
            self.spawn_timer = 0

        # 敌人逻辑
        for enemy in self.enemies:
            enemy.move_towards(self.player.x, self.y if hasattr(self, 'y') else self.player.y)
            
            # 碰撞伤害
            player_rect = pygame.Rect(self.player.x, self.player.y, self.player.size, self.player.size)
            enemy_rect = pygame.Rect(enemy.x, enemy.y, enemy.size, enemy.size)
            if player_rect.colliderect(enemy_rect):
                self.player.hp -= enemy.damage / 30 # 持续伤害
                if self.player.hp <= 0:
                    self.game_state = "GAME_OVER"

        if self.shake_time > 0:
            self.shake_time -= 1

    def draw_system_window(self):
        # 半透明背景
        s = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        s.set_alpha(200)
        s.fill(COLOR_BLACK)
        self.screen.blit(s, (0,0))
        
        # 边框
        pygame.draw.rect(self.screen, COLOR_BLUE, (100, 50, 600, 500), 5)
        pygame.draw.rect(self.screen, (0, 20, 50), (100, 50, 600, 500))
        
        title = self.font_large.render("STATUS WINDOW", True, COLOR_BLUE)
        self.screen.blit(title, (250, 70))
        
        stats = self.player.update_stats_display(self.font_small)
        for i, line in enumerate(stats):
            text = self.font_small.render(line, True, COLOR_WHITE)
            self.screen.blit(text, (120, 120 + i * 30))
            
        instr = self.font_small.render("[1] STR +  [2] AGI +  [3] SEN +  |  ESC to Close", True, COLOR_GOLD)
        self.screen.blit(instr, (120, 300))
        
        quest_title = self.font_small.render("DAILY QUEST: PREPARATION TO BECOME STRONG", True, COLOR_GOLD)
        self.screen.blit(quest_title, (120, 350))
        q1 = "Push-ups: " + ("DONE" if self.player.daily_progress["pushups"] >= self.player.daily_target else "INCOMPLETE") + " (Press Q)"
        q2 = "Squats: " + ("DONE" if self.player.daily_progress["squats"] >= self.player.daily_target else "INCOMPLETE") + " (Press W)"
        q3 = "Running: " + ("DONE" if self.player.daily_progress["running"] >= self.player.daily_target else "INCOMPLETE") + " (Press E)"
        
        self.screen.blit(self.font_small.render(q1, True, COLOR_WHITE), (120, 380))
        self.screen.blit(self.font_small.render(q2, True, COLOR_WHITE), (120, 410))
        self.screen.blit(self.font_small.render(q3, True, COLOR_WHITE), (120, 440))
        
        if self.player.daily_quest_completed:
            done_txt = self.font_large.render("QUEST COMPLETED!", True, COLOR_GOLD)
            self.screen.blit(done_txt, (250, 480))

    def draw(self):
        self.screen.fill(COLOR_GRAY)
        
        # 屏幕震动效果
        offset_x = random.randint(-2, 2) if self.shake_time > 0 else 0
        offset_y = random.randint(-2, 2) if self.shake_time > 0 else 0
        
        # 绘制实体
        self.player.draw(self.screen)
        for enemy in self.enemies:
            enemy.draw(self.screen)
            
        # UI: 消息日志
        for i, msg in enumerate(self.player.message_log):
            color = COLOR_BLUE if "System" in msg else COLOR_WHITE
            txt = self.font_small.render(msg, True, color)
            self.screen.blit(txt, (10, 10 + i * 25))
            
        # UI: 顶部信息
        top_info = f"Lv.{self.player.level} {self.player.rank} | HP: {int(self.player.hp)}/{self.player.max_hp}"
        txt_top = self.font_small.render(top_info, True, COLOR_WHITE)
        pygame.draw.rect(self.screen, COLOR_BLACK, (0, 0, SCREEN_WIDTH, 30))
        self.screen.blit(txt_top, (10, 5))

        if self.game_state == "SYSTEM_WINDOW":
            self.draw_system_window()
            
        if self.game_state == "GAME_OVER":
            over_txt = self.font_large.render("YOU DIED. PRESS R TO RESTART", True, COLOR_RED)
            self.screen.blit(over_txt, (SCREEN_WIDTH//2 - 200, SCREEN_HEIGHT//2))
            keys = pygame.key.get_pressed()
            if keys[pygame.K_r]:
                self.__init__() # 重置游戏

        pygame.display.flip()

    def run(self):
        running = True
        while running:
            self.clock.tick(FPS)
            running = self.handle_input()
            self.update()
            self.draw()
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()