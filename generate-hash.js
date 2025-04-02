const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function generateHash() {
    rl.question('Enter the password you want to hash: ', async (password) => {
        const saltRounds = 10
        const hash = await bcrypt.hash(password, saltRounds)
        console.log('\nYour hashed password:', hash)
        console.log('\nYou can now use this hash in your SQL insert statement.')
        rl.close()
    })
}

generateHash() 