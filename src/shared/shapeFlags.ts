/*
  const ShapeFlags = {
    element:0,
    component:0,
    text_children:0,
    array_children:0
  }
  这种也可以获取和设置，但是效率较低

  而位运算效率会高一些
  比如通过第一个0表示 element，第二个0表示 component，以此类推
  那上面就是 0000
  是 element 就是 0001
  同时还是 text_children 就是 0101
*/

export const enum ShapeFlags {
  ELEMENT = 1,                          // 0000000001
  FUNCTIONAL_COMPONENT = 1 << 1,        // 0000000010
  STATEFUL_COMPONENT = 1 << 2,          // 0000000100
  TEXT_CHILDREN = 1 << 3,               // 0000001000
  ARRAY_CHILDREN = 1 << 4,              // 0000010000
  SLOTS_CHILDREN = 1 << 5,              // 0000100000
  TELEPORT = 1 << 6,                    // 0001000000
  SUSPENSE = 1 << 7,                    // 0010000000
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 0100000000
  COMPONENT_KEPT_ALIVE = 1 << 9,        // 1000000000
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}