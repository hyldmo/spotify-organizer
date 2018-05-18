import { exec } from 'child_process'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'

type Travis = {
	script: string[]
}

const file = fs.readFileSync(path.join(__dirname, '../.travis.yml'), 'utf8')
const doc = yaml.safeLoad(file) as Travis

doc.script
	.map(script => script === 'yarn test:cover' ? 'yarn test' : script)
	.forEach(script => {
		console.info(`Running '${script}'`)
		// const [program, ...args] = script.split(' ')
		const child = exec(script)

		// child.stderr.pipe(process.stderr)
		// child.on('error', error => console.error(error.message))

		child.on('close', (code) => {
			switch (code) {
				case 0:
					console.log(`'${script}' ran successfully.`)
					break
				default:
					console.error(`'${script}' exited with code ${code}`)
					process.exit(code)
			}
		})
	})
