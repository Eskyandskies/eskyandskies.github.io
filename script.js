// 修正选择器，使用正确的ID
const startScreen = document.getElementById("start-screen");
const game = document.getElementById("game");
const startBtn = document.getElementById("start-btn");
const nameInput = document.getElementById("name-input");
const dialog = document.getElementById("dialog");
const audioControls = document.getElementById("audio-controls");

const speakerEl = document.getElementById("speaker");
const textEl = document.getElementById("text");
const optionsEl = document.getElementById("options");
const optionsInner = document.getElementById("options-inner");

let playerName = "你";
let index = 0;
let phase = 0;

// 音频元素
let bgm = null;
let clickSound = null;
let optionSound = null;
let bgmEnabled = true;
let sfxEnabled = true;
let volume = 0.7;

// 初始化音频
function initAudio() {
    // 创建背景音乐 - 使用Toned SFX风格的柔和环境音乐
    bgm = new Audio();
    
    // 使用Web Audio API创建更丰富的环境音效
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建环境音效
        createAmbientSound(audioContext);
        
        // 创建点击音效
        createClickSound(audioContext);
        
        // 创建选项音效
        createOptionSound(audioContext);
        
    } catch (e) {
        console.log("Web Audio API不支持，使用备用音频方案");
        createFallbackAudio();
    }
    
    // 音量控制
    const volumeControl = document.getElementById('volume-control');
    const bgmToggle = document.getElementById('bgm-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');
    
    volumeControl.addEventListener('input', function(e) {
        volume = e.target.value / 100;
        updateAudioVolume();
    });
    
    bgmToggle.addEventListener('click', function() {
        bgmEnabled = !bgmEnabled;
        this.classList.toggle('active', bgmEnabled);
        if (bgm) {
            if (bgmEnabled) {
                bgm.volume = volume;
                bgm.play().catch(e => console.log("自动播放被阻止:", e));
            } else {
                bgm.pause();
            }
        }
    });
    
    sfxToggle.addEventListener('click', function() {
        sfxEnabled = !sfxEnabled;
        this.classList.toggle('active', sfxEnabled);
    });
}

// 创建环境音效
function createAmbientSound(audioContext) {
    // 创建一个振荡器作为基础音
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 220; // A3音符
    
    // 添加轻微的频率调制
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.5; // 缓慢调制
    lfoGain.gain.value = 10; // 轻微调制
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    // 音量包络
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    lfo.start();
    
    // 保存引用
    bgm = {
        context: audioContext,
        oscillator: oscillator,
        gainNode: gainNode,
        lfo: lfo,
        lfoGain: lfoGain
    };
}

// 创建点击音效
function createClickSound(audioContext) {
    clickSound = function() {
        if (!sfxEnabled) return;
        
        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, now); // C5音符
        oscillator.frequency.exponentialRampToValueAtTime(392.00, now + 0.1); // G4音符
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * 0.2, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    };
}

// 创建选项音效
function createOptionSound(audioContext) {
    optionSound = function(pitch = 1) {
        if (!sfxEnabled) return;
        
        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'triangle';
        const baseFreq = 329.63 * pitch; // E4音符
        oscillator.frequency.setValueAtTime(baseFreq, now);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.15);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * 0.15, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    };
}

// 备用音频方案
function createFallbackAudio() {
    // 创建简单的音频元素作为备用
    bgm = new Audio();
    
    // 使用Web Audio API创建简单的音效
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    clickSound = function() {
        if (!sfxEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = volume * 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    };
    
    optionSound = function() {
        if (!sfxEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 600;
        gainNode.gain.value = volume * 0.15;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    };
}

// 更新音频音量
function updateAudioVolume() {
    if (bgm && bgm.gainNode) {
        bgm.gainNode.gain.value = volume * 0.3;
    }
}

// 播放点击音效
function playClickSound() {
    if (typeof clickSound === 'function') {
        clickSound();
    }
}

// 播放选项音效
function playOptionSound(pitch = 1) {
    if (typeof optionSound === 'function') {
        optionSound(pitch);
    }
}

/* ===== 剧情 ===== */
const story = [
    [
        ["？？？", "……你能听见吗？"],
        ["？？？", "原来如此，你叫 {name}。"],
        ["她", "那么，欢迎来到这里。"]
    ],
    [
        ["她", "别担心，这里很安全。"],
        ["她", "接下来，你要自己选择前进的方向。"]
    ],
    [
        ["她", "最后的路，需要你自己去探索。"],
        ["她", "无论选择哪一条，都会是属于你的故事。"]
    ],
    [
        ["系统", "新的旅程已经展开。"],
        ["系统", "现在，请选择你要前往的目的地："]
    ]
];

/* ===== 选项 ===== */
const optionsData = [
    [
        ["我已经准备好了"],
        ["再深呼吸一次"]
    ],
    [
        ["向前走一步"],
        ["暂时停留片刻"]
    ],
    [
        ["「CWF」", "CWF/index.html"],
        ["「CSP」", "CSP/index.html"],
        ["「LYH」", "LYH/index.html"],
        ["「ZSY」", "ZSY/ZSY.html"]
    ]
];

function showLine() {
    // 检查当前阶段和索引是否有效
    if (!story[phase] || index >= story[phase].length) {
        showOptions();
        return;
    }
    
    const line = story[phase][index];
    speakerEl.textContent = line[0];
    textEl.textContent = line[1].replace("{name}", playerName);
    index++;
    
    // 播放点击音效
    playClickSound();
}

function showOptions() {
    // 检查是否有选项
    if (!optionsData[phase]) {
        // 如果没有更多选项，显示结束信息
        speakerEl.textContent = "系统";
        textEl.textContent = "故事暂时告一段落。感谢你的参与，" + playerName + "！";
        return;
    }
    
    optionsInner.innerHTML = "";
    
    // 如果是第三个阶段（外部链接选项），添加提示信息
    if (phase === 2) {
        const hint = document.createElement("div");
        hint.className = "final-hint";
        hint.innerHTML = `请选择你的目的地，<span class="player-name">${playerName}</span>`;
        optionsInner.appendChild(hint);
    }
    
    optionsEl.style.display = "flex";
    
    // 播放选项出现音效
    playOptionSound(0.8);
    
    optionsData[phase].forEach((opt, i) => {
        const btn = document.createElement("div");
        btn.className = `option ${phase === 2 ? 'external-link' : ''}`;
        btn.textContent = opt[0];
        
        // 如果是外部链接选项，添加图标
        if (phase === 2) {
            const icon = document.createElement("i");
            icon.className = "option-icon fas fa-external-link-alt";
            btn.appendChild(icon);
        }
        
        btn.onclick = () => {
            // 播放选项选择音效
            playOptionSound(1 + i * 0.1);
            
            // 如果是外部链接选项，直接打开链接，不隐藏选项界面
            if (phase === 2 && opt[1]) {
                window.open(opt[1], "_blank");
                // 添加点击反馈但不关闭选项界面
                btn.style.background = "linear-gradient(135deg, #ff6b8b, var(--accent))";
                btn.style.transform = "scale(0.98)";
                
                // 短暂显示选择确认消息
                const originalText = textEl.textContent;
                textEl.textContent = `正在打开 ${opt[0].replace(/「|」/g, '')}...`;
                speakerEl.textContent = "系统";
                
                // 3秒后恢复
                setTimeout(() => {
                    textEl.textContent = originalText;
                    speakerEl.textContent = "系统";
                }, 2000);
            } else if (phase < 2) {
                // 如果是前两个阶段，正常进行
                optionsEl.style.display = "none";
                phase++;
                index = 0;
                setTimeout(() => showLine(), 300);
            }
        };
        
        optionsInner.appendChild(btn);
    });
}

// 对话框点击事件
dialog.onclick = () => {
    if (optionsEl.style.display === "flex") return;
    showLine();
};

// 开始按钮点击事件
startBtn.onclick = () => {
    playerName = nameInput.value.trim() || "你";
    
    // 播放开始音效
    playOptionSound(1.2);
    
    // 如果输入为空，给用户一个反馈
    if (nameInput.value.trim() === "") {
        nameInput.placeholder = "使用默认名字: '你'";
        nameInput.style.borderColor = "#ff8fa3";
    }
    
    // 淡出开始界面
    startScreen.style.opacity = "0";
    
    setTimeout(() => {
        startScreen.style.display = "none";
        game.style.display = "block";
        audioControls.style.display = "flex"; // 显示音频控制
        initAudio(); // 初始化音频
        showLine(); // 显示第一句对话
    }, 600);
};

// 按回车键也可以开始游戏
nameInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        startBtn.click();
    }
});

// 页面加载后聚焦到输入框
window.addEventListener("load", function() {
    nameInput.focus();
    
    // 添加页面点击解锁音频（解决浏览器自动播放策略）
    document.body.addEventListener('click', function initAudioOnClick() {
        // 移除事件监听器，只执行一次
        document.body.removeEventListener('click', initAudioOnClick);
    });
});
