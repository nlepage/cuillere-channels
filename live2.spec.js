const { cuillere, fork } = require('@cuillere/core')
const { channelsPlugin, chan, send, recv } = require('./live2')

describe('Live 2', () => {
    it('On doit pouvoir créer un channel avec buffer, et envoyer et recevoir dessus', async () => {
        let solde = 100
 
        function* main() {
            const depots = chan(5)
         
            let montants = [100, 200, 500, 1000, 600, 400, 300, 700, 900, 800]
            for (const montant of montants) yield fork(deposer(depots, montant))
         
            for (let i = 0; i < montants.length; i++) {
                const depot = yield recv(depots)
                solde = solde + depot
                console.log(`Dépôt de ${depot} reçu`)
            }
         
            console.log(`Nouveau solde de ${solde}`)
        }
         
        function* deposer(depots, montant) {
            yield send(depots, montant)
            console.log(`Dépôt de ${montant} terminé`)
        }

        const cllr = cuillere(channelsPlugin())

        await cllr.start(main())

        expect(solde).toBe(5600)
    })

    it("L'envoi et la réception sur un channel avec buffer ne doivent pas être bloquants", async () => {
        function* test() {
            const ch = chan(1)
            
            yield send(ch, 'test')

            return yield recv(ch)
        }

        const cllr = cuillere(channelsPlugin())

        await expect(cllr.start(test())).resolves.toBe('test')
    })
})
