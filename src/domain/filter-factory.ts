// FilterFactory

export interface Filter<T> {
  predicate: (item: T) => boolean
  apiFilterString: () => string
}

export class FilterFactory<T> {
  _true(): Filter<T> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      predicate: (_item: T) => {
        return true
      },
      apiFilterString: () => {
        return 'true'
      },
    }
  }

  _false(): Filter<T> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      predicate: (_item: T) => {
        return false
      },
      apiFilterString: () => {
        return 'false'
      },
    }
  }

  is_trivial_true(f: Filter<T>): boolean {
    return f.apiFilterString() === 'true'
  }

  is_trivial_false(f: Filter<T>): boolean {
    return f.apiFilterString() === 'false'
  }

  is_trivial(f: Filter<T>): boolean {
    return this.is_trivial_false(f) || this.is_trivial_true(f)
  }

  lt(field: keyof T, value: number): Filter<T> | undefined {
    if (value === Number.POSITIVE_INFINITY) {
      return this._true()
    } else if (value === Number.NEGATIVE_INFINITY) {
      return this._false()
    } else if (Number.isNaN(value)) {
      return undefined
    }
    return {
      predicate: (item: T) => {
        return (item[field] as number) < value
      },
      apiFilterString: () => {
        return `lt(${field as string},${value})`
      },
    }
  }

  lte(field: keyof T, value: number): Filter<T> | undefined {
    if (value === Number.POSITIVE_INFINITY) {
      return this._true()
    } else if (value === Number.NEGATIVE_INFINITY) {
      return this._false()
    } else if (Number.isNaN(value)) {
      return undefined
    }
    return {
      predicate: (item: T) => {
        return (item[field] as number) <= value
      },
      apiFilterString: () => {
        return `lte(${field as string},${value})`
      },
    }
  }

  gt(field: keyof T, value: number): Filter<T> | undefined {
    if (value === Number.POSITIVE_INFINITY) {
      return this._false()
    } else if (value === Number.NEGATIVE_INFINITY) {
      return this._true()
    } else if (Number.isNaN(value)) {
      return undefined
    }
    return {
      predicate: (item: T) => {
        return (item[field] as number) > value
      },
      apiFilterString: () => {
        return `gt(${field as string},${value})`
      },
    }
  }

  gte(field: keyof T, value: number): Filter<T> | undefined {
    if (value === Number.POSITIVE_INFINITY) {
      return this._false()
    } else if (value === Number.NEGATIVE_INFINITY) {
      return this._true()
    } else if (Number.isNaN(value)) {
      return undefined
    }
    return {
      predicate: (item: T) => {
        return (item[field] as number) >= value
      },
      apiFilterString: () => {
        return `gte(${field as string},${value})`
      },
    }
  }

  eq(field: keyof T, value: number | string): Filter<T> | undefined {
    if (Number.isNaN(value)) {
      return undefined
    }
    return {
      predicate: (item: T) => {
        return (item[field] as number | string) === value
      },
      apiFilterString: () => {
        if (typeof value === 'number') return `eq(${field as string},${value})`
        else return `eq(${field as string},"${value}")`
      },
    }
  }

  btw(field: keyof T, lowbound: number, highbound: number): Filter<T> | undefined {
    // TODO Handle date type
    if (highbound === Number.POSITIVE_INFINITY && lowbound === Number.NEGATIVE_INFINITY) {
      return this._true()
    } else if (highbound < lowbound) {
      return this._false()
    } else if (Number.isNaN(lowbound) || Number.isNaN(highbound)) {
      return undefined
    }
    return {
      predicate: (item: T) => {
        return (item[field] as number) <= highbound && (item[field] as number) >= lowbound
      },
      apiFilterString: () => {
        return `btw(${field as string},${lowbound},${highbound})`
      },
    }
  }

  stw(field: keyof T, head: string): Filter<T> | undefined {
    if (head.length === 0) {
      return this._true()
    }
    return {
      predicate: (item: T) => {
        return (item[field] as string).startsWith(head)
      },
      apiFilterString: () => {
        return `stw(${field as string},"${head}")`
      },
    }
  }

  ctn(field: keyof T, value: string): Filter<T> | undefined {
    if (value.length === 0) {
      return this._true()
    }
    return {
      predicate: (item: T) => {
        return (item[field] as string).includes(value)
      },
      apiFilterString: () => {
        return `ctn(${field as string},"${value}")`
      },
    }
  }

  in(field: keyof T, values: (number | string)[] | undefined): Filter<T> | undefined {
    if (typeof values === 'undefined') {
      return undefined
    } else if (values?.length === 0) {
      return this._true()
    }
    return {
      predicate: (item: T) => {
        return values.includes(item[field] as number | string)
      },
      apiFilterString: () => {
        return `in(${field as string},${'"' + values.join('","') + '"'})`
      },
    }
  }

  and(...filters: (Filter<T> | undefined)[]): Filter<T> | undefined {
    if (filters.length === 0) {
      return undefined
    } else if (
      filters.some((filter) => {
        return typeof filter === 'undefined'
      })
    ) {
      return undefined
    } else if (
      filters.some((filter) => {
        return filter?.apiFilterString() === 'false'
      })
    ) {
      return this._false()
    }

    return {
      predicate: (item: T) => {
        return filters.every((filter: Filter<T> | undefined) => {
          return filter?.predicate(item)
        })
      },
      apiFilterString: () => {
        const nontrivialApiStrings = filters
          .map((filter) => filter?.apiFilterString() as string)
          .filter((str: string) => {
            return str !== 'true'
          })
        if (nontrivialApiStrings.length === 0) return 'true'
        if (nontrivialApiStrings.length === 1) return nontrivialApiStrings.at(0) as string
        return 'and(' + nontrivialApiStrings.join(',') + ')'
      },
    }
  }

  or(...filters: (Filter<T> | undefined)[]): Filter<T> | undefined {
    if (filters.length === 0) {
      return undefined
    } else if (
      filters.some((filter) => {
        return typeof filter === 'undefined'
      })
    ) {
      return undefined
    } else if (
      filters.some((filter) => {
        return filter?.apiFilterString() === 'true'
      })
    ) {
      return this._true()
    }

    return {
      predicate: (item: T) => {
        return filters.some((filter: Filter<T> | undefined) => {
          return filter?.predicate(item)
        })
      },
      apiFilterString: () => {
        const nontrivialApiStrings = filters
          .map((filter) => filter?.apiFilterString() as string)
          .filter((str: string) => {
            return str !== 'false'
          })
        if (nontrivialApiStrings.length === 0) return 'false'
        if (nontrivialApiStrings.length === 1) return nontrivialApiStrings.at(0) as string
        return 'or(' + nontrivialApiStrings.join(',') + ')'
      },
    }
  }

  not(filter: Filter<T> | undefined): Filter<T> | undefined {
    if (typeof filter === 'undefined') {
      return undefined
    } else if (filter?.apiFilterString() === 'true') {
      return this._false()
    } else if (filter?.apiFilterString() === 'false') {
      return this._true()
    }
    return {
      predicate: (item: T) => {
        return !filter?.predicate(item)
      },
      apiFilterString: () => {
        return 'not(' + filter?.apiFilterString() + ')'
      },
    }
  }
}
