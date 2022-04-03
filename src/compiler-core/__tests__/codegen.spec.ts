import { baseParse } from '../src/parse'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'
import { transformExpression } from '../transforms/transformExpression'

describe('codegen',() => {
  test('string',() => {
    const ast = baseParse('test string')

    transform(ast)

    const {code} = generate(ast)

    expect(code).toMatchSnapshot()
  })

  test('interpolation',() => {
    const ast = baseParse('{{message}}')

    transform(ast,{
      nodeTransforms:[transformExpression]
    })

    const {code} = generate(ast)

    expect(code).toMatchSnapshot()
  })
})