function channelsPlugin() {
    return {
        namespace: '@channels',
        handlers: {
            async* send({ key, value }) {
                const ch = chans.get(key)

                if (ch.closed) throw new Error('channel is closed')

                const rcver = ch.recvQ.shift()
                if (rcver) {
                    rcver([value, true])
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

            async* recv({ key, detail }) {
                const ch = chans.get(key)

                if (ch.bufferLength !== 0) {
                    const value = ch.buffer[0]
                    ch.buffer.copyWithin(0, 1)

                    const sender = ch.sendQ.shift()
                    if (sender) ch.buffer[ch.bufferLength - 1] = sender()
                    else ch.bufferLength--

                    return detail ? [value, true] : value
                }

                const sender = ch.sendQ.shift()
                if (sender) return detail ? [sender(), true] : sender()

                if (ch.closed) return detail ? [undefined, false] : undefined

                return new Promise(resolve => {
                    ch.recvQ.push(detail ? resolve : ([value]) => resolve(value))
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
        closed: false,
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

function recv(key, detail = false) {
    return {
        kind: '@channels/recv',
        key,
        detail,
    }
}

function close(key) {
    const ch = chans.get(key)

    if (ch.closed) throw new Error('channel already closed')

    ch.closed = true

    let recver
    while (recver = ch.recvQ.shift()) recver([undefined, false])
}

module.exports = {
    channelsPlugin,
    chan,
    send,
    recv,
    close,
}
