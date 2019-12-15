import typescript from 'rollup-plugin-typescript2';
 
export default {
    input: './src/module.ts',
    output: {
        file: './lib/module.js',
        format: 'esm'
    },
    plugins: [
        typescript()
    ]
}