(async()=>{
    const tsukinose = 'https://i.imgur.com/orQHJ51.png';
    await import('https://rpgen3.github.io/lib/lib/jquery-3.5.1.min.js');
    const rpgen3 = await Promise.all([
        'baseN',
        'css',
        'hankaku',
        'random',
        'save',
        'url',
        'util',
        'strToImg'
    ].map(v=>import(`https://rpgen3.github.io/mylib/export/${v}.mjs`))).then(v=>Object.assign({},...v));
    const h = $("<body>").appendTo("html").css({
        "text-align": "center",
        padding: "1em"
    });
    $("<h1>").appendTo(h).text("ツキノセラン製作予定地");
    $("<button>").appendTo(h).text("randInt").on("click",()=>{
        msg(rpgen3.randInt(0,114514));
    });
    const hMsg = $("<div>").appendTo(h);
    function msg(str, isError){
        $("<span>").appendTo(hMsg.empty()).text(str).css({
            color: isError ? 'red' : 'blue',
            backgroundColor: isError ? 'pink' : 'lightblue'
        })
    }
})();
