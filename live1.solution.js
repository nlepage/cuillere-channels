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

            async* recv({ key, value }) {
                const ch = chans.get(key)

                const sender = ch.sendQ.shift()
                if (sender) {
                    return sender()
                }

                return new Promise(resolve => {
                    ch.recvQ.push(resolve)
                })
            },
        }
    }
}

const chans = new WeakMap()
let id = 1

function chan() {
    const key = new String(`chan #${id++}`)
    chans.set(key, {
        sendQ: [],
        recvQ: [],
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