export namespace Dispatch {

  export interface ShippingOption {
    id: number
    shop_id: number|null
    name: string
    carrier: string|null
    created_at: string|null
    updated_at: string|null
    name_formatted: any|null
    rate: ShippingOptionRate
  }

  export interface ShippingOptionRate {
    id: number
    shipping_option_id: number
    amount: number
    currency: string
    delivery_days: number|null
    easypost_shipment_id: string|null
    easypost_rate_id: string|null
    created_at: string|null
    updated_at: string|null
    amount_decimal: any|null
  }

  export interface ShippingProfile {
    id: number
    name: string|null
    weight: number|null
    weight_unit: string
    width: number|null
    height: number|null
    length: number|null
    length_unit: string
    delivers_to: string[]|null
    dispatch_period: number|null
    free_shipping_international: boolean
    free_shipping_domestic: boolean
    handling_fee: number|null
    handling_fee_decimal: number|null
    custom_rates: boolean|null
    is_shared: boolean
    dispatch_period_name: string
    automatic_shipping_options: Array<ShippingOption & { shop_id: null }>
    custom_shipping_options: Array<ShippingOption & { shop_id: null }>
    available_shipping_options?: Array<ShippingOption & { id: number | null }>
  }

  export interface ShippingAddress {
    name?: string
    phone?: string
    line1: string
    line2?: string|null
    city: string
    state: string
    country: string
    country_name?: string
    postal_code: string
    zip?: string
  }

  export interface EasyPostShipment {
    id: number
    easypost_shipment_id: string
    shippable_type: string
    shippable_id: number
    created_at: string|null
    updated_at: string|null
    postage_label_url: string
    tracking_details: string|null
    tracking_code: string|null
  }

  export interface ShippingProfileFormData {
    id?: number|null
    name?: string|null
    weight: number|null
    weight_unit: string
    width: number|null
    height: number|null
    length: number|null
    length_unit: string
    handling_fee: number|null
    delivers_to: string[]|null
    dispatch_period: number|null
    free_shipping_international: boolean
    free_shipping_domestic: boolean
    custom_rates: boolean|null
    dispatch_address_data?: ShippingAddress|null
    automatic_shipping_options?: number[]
    custom_shipping_options?: Array<ShippingOption & { id: number | null }>
  }

}
