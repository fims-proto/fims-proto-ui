// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BaseNode = (props: any) => {
  return props.content
}

BaseNode.props = {
  content: {
    required: true,
  },
}

export default BaseNode
