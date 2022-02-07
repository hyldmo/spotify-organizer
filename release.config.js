/* eslint-disable no-template-curly-in-string */
module.exports = {
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'angular',
				parserOpts: {
					mergePattern: /^Merge pull request #(\\d+) from (.*)$/,
					mergeCorrespondence: ['id', 'source']
				},
				releaseRules: [
					{
						type: 'Update',
						release: 'patch'
					}
				]
			}
		],
		'@semantic-release/release-notes-generator',
		'@semantic-release/github'
	]
}
