function channelsPlugin() {
    return {
        namespace: '@channels',
        handlers: {
            async* send({ key, value }) {
                const ch = chans.get(key)

                const rcver = ch.recvQ.shift()
                if (rcver) {
                    rcver(value)
                    return
                }

                return new Promise(resolve => {
                    ch.sendQ.push(() => {
                        resolve()
                        return value
                    })
                })
            },

            async* recv({ key }) {
                const ch = chans.get(key)

                const sender = ch.sendQ.shift()
                if (sender) return sender()

                return new Promise(resolve => {
                    ch.recvQ.push(resolve)
                })
            },
        }
    }
}

const chans = new WeakMap()

function chan(capacity) {
    const key = {
        get [Symbol.toStringTag]() { return 'chan' }
    }
    chans.set(key, {
        sendQ: [],
        recvQ: [],
        buffer: Array(capacity),
        bufferLength: 0,
    })
    return key
}

function send(key, value) {
    return {
        kind: '@channels/send',
        key,
        value,
    }
}

function recv(key) {
    return {
        kind: '@channels/recv',
        key,
    }
}

module.exports = {
    channelsPlugin,
    chan,
    send,
    recv,
}
