class MathMatchingGame {
    constructor() {
        this.currentDifficulty = 'easy';
        this.gameData = [];
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.score = 0;
        this.startTime = null;
        this.timerInterval = null;
        
        this.initializeGame();
        this.bindEvents();
    }

    // 游戏数据定义
    getGameData() {
        const data = {
            easy: [
                // 基础分数、小数、百分数转换
                { group: 1, values: ['1/2', '0.5', '50%', '50/100'] },
                { group: 2, values: ['1/4', '0.25', '25%', '25/100'] },
                { group: 3, values: ['3/4', '0.75', '75%', '75/100'] },
                { group: 4, values: ['1/5', '0.2', '20%', '20/100'] },
                { group: 5, values: ['2/5', '0.4', '40%', '40/100'] },
                { group: 6, values: ['1/10', '0.1', '10%', '10/100'] }
            ],
            medium: [
                // 包含比例的转换
                { group: 1, values: ['3/8', '0.375', '37.5%', '3:8'] },
                { group: 2, values: ['5/8', '0.625', '62.5%', '5:8'] },
                { group: 3, values: ['2/3', '0.667', '66.7%', '2:3'] },
                { group: 4, values: ['1/3', '0.333', '33.3%', '1:3'] },
                { group: 5, values: ['7/10', '0.7', '70%', '7:10'] },
                { group: 6, values: ['3/5', '0.6', '60%', '3:5'] }
            ],
            hard: [
                // 复杂转换
                { group: 1, values: ['5/6', '0.833', '83.3%', '5:6'] },
                { group: 2, values: ['7/8', '0.875', '87.5%', '7:8'] },
                { group: 3, values: ['11/20', '0.55', '55%', '11:20'] },
                { group: 4, values: ['13/25', '0.52', '52%', '13:25'] },
                { group: 5, values: ['17/50', '0.34', '34%', '17:50'] },
                { group: 6, values: ['9/16', '0.5625', '56.25%', '9:16'] }
            ]
        };
        return data[this.currentDifficulty];
    }

    // 初始化游戏
    initializeGame() {
        this.resetGame();
        this.createGameBoard();
        this.updateDisplay();
    }

    // 重置游戏状态
    resetGame() {
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.startTime = Date.now();
        this.clearTimer();
        this.startTimer();
        
        // 生成游戏数据
        const rawData = this.getGameData();
        // 随机打乱组顺序，并只取前5组（每组4个，共20个卡片，10对）
        this.shuffleArray(rawData);
        const selectedGroups = rawData.slice(0, 5);
        
        this.gameData = [];
        
        selectedGroups.forEach(group => {
            group.values.forEach(value => {
                this.gameData.push({
                    id: `${group.group}-${value}`,
                    group: group.group,
                    value: value,
                    matched: false
                });
            });
        });
        
        this.totalPairs = this.gameData.length / 2;
        this.shuffleArray(this.gameData);
    }

    // 创建游戏板
    createGameBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        this.gameData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = item.id;
            card.dataset.group = item.group;
            card.textContent = item.value;
            
            // Add staggered animation delay
            card.style.animationDelay = `${index * 0.05}s`;
            
            card.addEventListener('click', () => this.handleCardClick(card, item));
            gameBoard.appendChild(card);
        });
    }

    // 处理卡片点击
    handleCardClick(cardElement, cardData) {
        if (cardData.matched || this.selectedCards.length >= 2) return;
        
        // 检查是否已经选中
        if (this.selectedCards.find(selected => selected.data.id === cardData.id)) return;
        
        cardElement.classList.add('selected');
        this.selectedCards.push({ element: cardElement, data: cardData });
        
        if (this.selectedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 500);
        }
    }

    // 检查匹配
    checkMatch() {
        const [card1, card2] = this.selectedCards;
        
        if (card1.data.group === card2.data.group) {
            // 匹配成功
            this.handleMatch();
        } else {
            // 匹配失败
            this.handleMismatch();
        }
        
        this.selectedCards = [];
    }

    // 处理匹配成功
    handleMatch() {
        this.selectedCards.forEach(selected => {
            selected.element.classList.remove('selected');
            selected.element.classList.add('matched');
            selected.data.matched = true;
        });
        
        this.matchedPairs++;
        this.score += 10;
        this.updateDisplay();
        
        if (this.matchedPairs === this.totalPairs) {
            setTimeout(() => this.gameComplete(), 1000);
        }
    }

    // 处理匹配失败
    handleMismatch() {
        this.selectedCards.forEach(selected => {
            selected.element.classList.remove('selected');
            selected.element.classList.add('wrong');
            
            setTimeout(() => {
                selected.element.classList.remove('wrong');
            }, 500);
        });
        
        this.score = Math.max(0, this.score - 2);
        this.updateDisplay();
    }

    // 游戏完成
    gameComplete() {
        this.clearTimer();
        const finalTime = this.formatTime(Date.now() - this.startTime);
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalTime').textContent = finalTime;
        document.getElementById('congratulations').classList.remove('hidden');
    }

    // 更新显示
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('matches').textContent = this.matchedPairs;
        document.getElementById('totalMatches').textContent = this.totalPairs;
    }

    // 开始计时器
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            document.getElementById('timer').textContent = this.formatTime(elapsed);
        }, 1000);
    }

    // 清除计时器
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // 格式化时间
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 洗牌算法
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 显示提示
    showHint() {
        const hints = {
            easy: '提示：寻找相等的分数、小数和百分数。例如：1/2 = 0.5 = 50%',
            medium: '提示：注意比例的表示方法。例如：3/8 = 0.375 = 37.5% = 3:8',
            hard: '提示：仔细计算复杂分数的小数和百分数形式。注意四舍五入！'
        };
        
        document.getElementById('hintText').textContent = hints[this.currentDifficulty];
        document.getElementById('hintModal').classList.remove('hidden');
    }

    // 绑定事件
    bindEvents() {
        // 难度选择
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.initializeGame();
        });

        // 新游戏按钮
        document.getElementById('newGame').addEventListener('click', () => {
            this.initializeGame();
        });

        // 提示按钮
        document.getElementById('hint').addEventListener('click', () => {
            this.showHint();
        });

        // 再玩一次按钮
        document.getElementById('playAgain').addEventListener('click', () => {
            document.getElementById('congratulations').classList.add('hidden');
            this.initializeGame();
        });

        // 关闭模态框
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('hintModal').classList.add('hidden');
        });

        // 点击模态框外部关闭
        document.getElementById('hintModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('hintModal')) {
                document.getElementById('hintModal').classList.add('hidden');
            }
        });

        document.getElementById('congratulations').addEventListener('click', (e) => {
            if (e.target === document.getElementById('congratulations')) {
                document.getElementById('congratulations').classList.add('hidden');
                this.initializeGame();
            }
        });
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new MathMatchingGame();
});