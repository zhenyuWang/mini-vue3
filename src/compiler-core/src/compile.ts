import { transformElement } from '../transforms/transformElement'
import { transformExpression } from '../transforms/transformExpression'
import { transformText } from '../transforms/transformText'
import { generate } from './codegen'
import { baseParse } from './parse'
import { transform } from './transform'

export function baseCompile(template){
  const ast:any = baseParse('<div>hi,{{message}}</div>')

  transform(ast,{
    nodeTransforms:[transformElement,transformText,transformExpression]
  })

  return generate(ast)
}