import { baseParse } from '../src/parse'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'
import { transformExpression } from '../transforms/transformExpression'
import { transformElement } from '../transforms/transformElement'
import { transformText } from '../transforms/transformText'

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

  test('element',() => {
    const ast = baseParse('<div></div>')

    transform(ast,{
      nodeTransforms:[transformElement]
    })

    const {code} = generate(ast)

    expect(code).toMatchSnapshot()
  })

  test('happy path',() => {
    const ast:any = baseParse('<div>hi,{{message}}</div>')

    transform(ast,{
      nodeTransforms:[transformElement,transformText,transformExpression]
    })

    const {code} = generate(ast)

    expect(code).toMatchSnapshot()
  })
})