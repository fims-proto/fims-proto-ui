import axios from 'axios'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../field-conversion'
import { invokeWithErrorHandler, type Response } from '../error-handler'
import { type Page, type Pageable } from '../types'
import { FilterFactory } from '../filter'
import {
  type DimensionCategory,
  type DimensionOption,
  type UpsertDimensionCategory,
  type UpsertDimensionOption,
} from './types'

const DIMENSION_FIELDS_CONVERSION = {
  createdAt: 'date' as const,
  updatedAt: 'date' as const,
}

class DimensionService {
  // ── Categories ──────────────────────────────────────────────────────────────

  public async getDimensionCategories(
    sobId: string,
    pageable: Pageable = { page: 1, size: 50 },
  ): Promise<Response<Page<DimensionCategory>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/dimension/categories?$sort=createdAt&$page=${pageable.page}&$size=${pageable.size}`,
      )
      convertFieldsFromString(result.data.content, DIMENSION_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getDimensionCategoryById(sobId: string, categoryId: string): Promise<Response<DimensionCategory>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/dimension/category/${categoryId}`)
      return convertFieldsFromString(result.data, DIMENSION_FIELDS_CONVERSION)
    })
  }

  public async createDimensionCategory(sobId: string, category: UpsertDimensionCategory): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/dimension/categories`, category)
    })
  }

  public async updateDimensionCategory(
    sobId: string,
    categoryId: string,
    data: UpsertDimensionCategory,
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/dimension/category/${categoryId}`, data)
    })
  }

  public async deleteDimensionCategory(sobId: string, categoryId: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.delete(`${FIMS_URL}/api/v1/sob/${sobId}/dimension/category/${categoryId}`)
    })
  }

  // ── Options ──────────────────────────────────────────────────────────────────

  public async getDimensionOptions(
    sobId: string,
    categoryId: string,
    pageable: Pageable = { page: 1, size: 20 },
    searchQuery?: string,
  ): Promise<Response<Page<DimensionOption>>> {
    return invokeWithErrorHandler(async () => {
      const factory = new FilterFactory<DimensionOption>()
      const filter = searchQuery ? factory.ctn('name', searchQuery) : undefined
      const filterStr = filter ? `&$filter=${filter.apiFilterString()}` : ''
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/dimension/category/${categoryId}/options?$sort=createdAt&$page=${pageable.page}&$size=${pageable.size}${filterStr}`,
      )
      convertFieldsFromString(result.data.content, DIMENSION_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async createDimensionOption(
    sobId: string,
    categoryId: string,
    option: UpsertDimensionOption,
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/dimension/category/${categoryId}/options`, option)
    })
  }

  public async updateDimensionOption(
    sobId: string,
    categoryId: string,
    optionId: string,
    data: UpsertDimensionOption,
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/dimension/category/${categoryId}/option/${optionId}`, data)
    })
  }

  public async deleteDimensionOption(sobId: string, categoryId: string, optionId: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.delete(`${FIMS_URL}/api/v1/sob/${sobId}/dimension/category/${categoryId}/option/${optionId}`)
    })
  }
}

export const DimensionServiceInstance = new DimensionService()
