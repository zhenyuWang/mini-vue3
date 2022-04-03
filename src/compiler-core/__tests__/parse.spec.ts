import { NodeTypes } from '../src/ast'
import {baseParse} from '../src/parse'

describe('Parse',() => {
  describe('interpolation',() => {
    test('simple interpolation',() => {
      const ast = baseParse('{{message}}')

      expect(ast.children[0]).toStrictEqual({
        type:NodeTypes.INTERPOLATION,
        content:{
          type:NodeTypes.SIMPLE_EXPRESSION,
          content:'message'
        }
      })
    })
  })

  describe('element',() => {
    test('simple element div',() => {
      const ast = baseParse('<div></div>')

      expect(ast.children[0]).toStrictEqual({
        type:NodeTypes.ELEMENT,
        tag:'div',
        children:[]
      })
    })
  })

  describe('text',() => {
    test('simple text',() => {
      const ast = baseParse('some text')

      expect(ast.children[0]).toStrictEqual({
        type:NodeTypes.Text,
        content:'some text',
      })
    })
  })

  test('hello world',() => {
    const ast = baseParse('<div>h1,{{message}}</div>')

    expect(ast.children[0]).toStrictEqual({
      type:NodeTypes.ELEMENT,
      tag:'div',
      children:[
        {
          type:NodeTypes.Text,
          content:'h1,',
        },
        {
          type:NodeTypes.INTERPOLATION,
          content:{
            type:NodeTypes.SIMPLE_EXPRESSION,
            content:'message'
          }
        }
      ]
    })
  })

  test('Nested element',() => {
    const ast = baseParse('<div><p>h1</p>{{message}}</div>')

    expect(ast.children[0]).toStrictEqual({
      type:NodeTypes.ELEMENT,
      tag:'div',
      children:[
        {
          type:NodeTypes.ELEMENT,
          tag:'p',
          children:[
            {
              type:NodeTypes.Text,
              content:'h1',
            }
          ]
        },
        {
          type:NodeTypes.INTERPOLATION,
          content:{
            type:NodeTypes.SIMPLE_EXPRESSION,
            content:'message'
          }
        }
      ]
    })
  })

  test('should throw error when lack end tag',() => {
    expect(() => {
      baseParse('<div><span></div>')
    }).toThrow('span lack end tag')
  })
})