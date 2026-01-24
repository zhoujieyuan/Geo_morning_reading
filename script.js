function loadTask() {
    fetch('data.json?t=' + new Date().getTime())
        .then(response => {
            const serverDateStr = response.headers.get('Date');
            if (!serverDateStr) throw new Error("无法获取服务器时间");
            const serverTime = new Date(serverDateStr);
            return response.json().then(data => ({ data, serverTime }));
        })
        .then(({ data, serverTime }) => {
            document.getElementById('reading').innerText = data.reading;
            // 显示目标时间 (把 T 换成 空格，好看点)
            document.getElementById('target-time').innerText = data.open_datetime ? data.open_datetime.replace('T', ' ') : "未设定";
            checkTime(data, serverTime);
        })
        .catch(err => console.error("加载中...", err));
}

function checkTime(data, serverTime) {
    if (!data.open_datetime) return; // 如果没设时间，默认锁定

    // 1. 计算【当前服务器的北京时间】字符串
    // 服务器是 GMT，我们要加 8 小时
    let beijingTime = new Date(serverTime.getTime() + 8 * 60 * 60 * 1000);
    
    // 格式化成 YYYY-MM-DDTHH:mm 这种标准格式，方便字符串比较
    // 注意：toISOString 会减回 8 小时显示 UTC，所以我们手动拼字符串最稳
    const pad = n => n.toString().padStart(2, '0');
    const currentStr = 
        beijingTime.getUTCFullYear() + "-" + 
        pad(beijingTime.getUTCMonth() + 1) + "-" + 
        pad(beijingTime.getUTCDate()) + "T" + 
        pad(beijingTime.getUTCHours()) + ":" + 
        pad(beijingTime.getUTCMinutes());

    // 2. 获取【设定的目标时间】字符串
    const targetStr = data.open_datetime;

    const dictationDiv = document.getElementById('dictation');
    const lockDiv = document.getElementById('lock');
    const statusText = document.getElementById('status-text');

    // 3. 核心比较：字符串直接比大小 (例如 "2023-10-27T08:00" > "2023-10-26T20:00")
    if (currentStr >= targetStr) {
        dictationDiv.innerText = data.dictation;
        dictationDiv.classList.remove('hidden');
        lockDiv.classList.add('hidden');
    } else {
        dictationDiv.classList.add('hidden');
        lockDiv.classList.remove('hidden');
        // 显示当前服务器日期和时间
        statusText.innerText = currentStr.replace('T', ' '); 
    }
}

loadTask();
setInterval(loadTask, 5000); // 每5秒检查一次