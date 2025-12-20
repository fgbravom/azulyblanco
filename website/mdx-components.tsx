import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getMDXComponents } from './components/mdx/MDXComponents'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getMDXComponents(components)
}
