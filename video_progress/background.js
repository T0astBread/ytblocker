const contentScriptPorts = []


const handleMessage = (message, port) => {
    switch (message.action) {
        case "saveProgress":
            handleSaveMessage(message)
            break
        case "loadProgress":
            handleLoadMessage(message, port)
            break
    }
}


const handleSaveMessage = ({ videoID, progress, duration }) => {
    console.log(`[Progress Saver] Recieved save message for video ${videoID}`)

    const addObj = {}

    addObj[videoID] = {
        videoID,
        progress,
        duration
    }

    browser.storage.local.set(addObj)
}


const handleLoadMessage = ({ videoID }, port) => {
    console.log(`[Progress Saver] Recieved load message for video ${videoID}`)

    browser.storage.local.get(videoID)
        .then(data => {
            data = data[videoID]
            port.postMessage({
                action: "loadProgress",
                videoID,
                data
            })
        })
}


const handleDisconnect = port => {
    const portID = port.sender.tab.id
    contentScriptPorts[portID] = null

    console.log(`[Progress Saver] Disconnected port #${portID}`)
}


const handleConnection = port => {
    const portID = port.sender.tab.id
    contentScriptPorts[portID] = port

    port.onMessage.addListener(message => handleMessage(message, port))
    port.onDisconnect.addListener(handleDisconnect)

    console.log(`[Progress Saver] Connected port #${portID}`)
}


browser.runtime.onConnect.addListener(handleConnection)

