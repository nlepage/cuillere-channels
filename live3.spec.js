const { cuillere, fork } = require('@cuillere/core')
const { channelsPlugin, chan, send, recv, close } = require('./live3')

describe('Live 1', () => {
    it('On doit pouvoir créer un channel, et envoyer et recevoir dessus', async () => {
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
})
