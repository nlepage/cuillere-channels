const { cuillere, fork } = require('@cuillere/core')
const { channelsPlugin, chan, send, recv, close } = require('./live')

describe('Live 3', () => {
    it('On doit pouvoir fermer un channel, et savoir si il est fermé', async () => {
        let solde = 100

        function* main() {
            const depots = chan(5)

            yield fork(deposer(depots, [100, 200, 500, 1000, 600, 400, 300, 700, 900, 800]))

            while (true) {
                const [depot, ok] = yield recv(depots, true)
                if (!ok) break
                solde = solde + depot
                console.log(`Dépôt de ${depot} reçu`)
            }

            console.log(`Nouveau solde de ${solde}`)
        }

        function* deposer(depots, montants) {
            for (const montant of montants) {
                yield send(depots, montant)
            }
            close(depots)
        }

        const cllr = cuillere(channelsPlugin())

        await cllr.start(main())

        expect(solde).toBe(5600)
    })

    it('On ne doit pas pouvoir envoyer sur un channel fermé', async () => {
        function* test() {
            const ch = chan()
            close(ch)
            yield send(ch, 123)
        }

        const cllr = cuillere(channelsPlugin())

        await expect(cllr.start(test())).rejects.toEqual(new Error('send on closed channel'))
    })


    it("On ne doit pouvoir fermer un channel Qu'une seule fois", async () => {
        function test() {
            const ch = chan()
            close(ch)
            close(ch)
        }

        expect(test).toThrow(new Error('channel already closed'))
    })
})
