const { cuillere, fork } = require('@cuillere/core')
const { channelsPlugin, chan, send, close, range } = require('./live')

describe('Live 4', () => {
    it('On doit pouvoir itérer sur un channel', async () => {
        let solde = 100

        async function* main() {
            const depots = chan(5)

            yield fork(deposer(depots, [100, 200, 500, 1000, 600, 400, 300, 700, 900, 800]))

            for await (const depot of range(depots)) {
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
