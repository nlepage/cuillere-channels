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

                if (ch.bufferLength !== ch.buffer.length) {
                    ch.buffer[ch.bufferLength] = value
                    ch.bufferLength++
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

                if (ch.bufferLength !== 0) {
                    const value = ch.buffer[0]
                    ch.buffer.copyWithin(0, 1)

                    const sender = ch.sendQ.shift()
                    if (sender) ch.buffer[ch.bufferLength - 1] = sender()
                    else ch.bufferLength--

                    return value
                }

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

function chan(capacity = 0) {
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

function close(key) {
    // FIXME
}

module.exports = {
    channelsPlugin,
    chan,
    send,
    recv,
    close,
}
