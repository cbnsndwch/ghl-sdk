import type { QueryFilter } from 'mongoose';

/**
 * An input data contract for paginated list endpoints.
 */
export interface IListInput<T> {
    /**
     * (Optional) How many records to skip before returning results.
     */
    offset?: number;

    /**
     * (Optional) How many records to return per page.
     */
    limit?: number;

    /**
     * (Optional) MongoDB filter to apply to the query.
     */
    filters?: QueryFilter<T>;

    /**
     * (Optional) MongoDB projection to apply to the query.
     */
    projection?: Array<keyof T> | Record<keyof T, 0 | 1>;
}
