import { baseParse } from '../src/parse'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'

describe('codegen',() => {
  test('string',() => {
    const ast = baseParse('test string')

    transform(ast)

    const {code} = generate(ast)

    expect(code).toMatchSnapshot()
  })
})