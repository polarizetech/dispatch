import { useEffect } from 'react'
import { lang as __ } from '@/Hooks/useLang'
import InputLabel from '@/Components/TranslatedInputLabel'
import { Select } from '@/catalyst-ui/select'
import ValidationErrors from '@/Components/ValidationErrors'
import { Cart, OrderProduct, ShippingOption, ShippingProfile, Shop } from '@/types'
import { useForm } from '@inertiajs/react'
import clsx from 'clsx'
import LoadingIcon from '@/Components/Icons/LoadingIcon'
import useTypedPage from '@/Hooks/useTypedPage'

interface Props {
  shippable: OrderProduct
  shippingProfile: ShippingProfile
  onChange: (shippingOption: ShippingOption|null) => void
  className?: string
}

const ShippingOptionSelect: React.FC<Props> = ({ shippable, shippingProfile, onChange, ...props }) => {

  const form = useForm<{
          country: string|null
          postal_code: string|null
          shipping_option_id: number|null
        }>({
          country: null,
          postal_code: null,
          shipping_option_id: null
        }),
        { shop, currentCart } = useTypedPage<{ currentCart: Cart, shop: Shop }>().props,
        shippingOptions = shippingProfile?.available_shipping_options || [],
        formatPrice = (price: number) => Intl.NumberFormat('en-US', { style: 'currency', currency: shop ? shop.currency : currentCart.currency }).format(price)

  useEffect(() => {
    if (shippable.shipping_option_id) {
      form.setData('shipping_option_id', shippable.shipping_option_id)
    }
  }, [shippable.shipping_option_id])

  useEffect(() => {
    const shippingOption = shippingOptions.find(op => op.id === form.data.shipping_option_id) || null
    onChange?.(shippingOption)
  }, [form.data.shipping_option_id])

  return (
    <div className={clsx('bg-chrome-400/60 p-4 flex-1', props.className)}>
      <div className="space-y-4">

        <fieldset className="space-y-1">
          <InputLabel lang="shipping.select_shipping_option" value="Shipping Options" disableTranslationsEditor />
          <div className="relative">
            <Select
              value={form.data.shipping_option_id || '0'}
              onChange={(event: any) => form.setData('shipping_option_id', parseInt(event.currentTarget.value))}
              className="w-full !text-sm h-9 !py-0"
              disabled={shippingOptions.length === 0 || form.processing}
            >
              <option value="0" disabled>{shippingOptions.length === 0 ? __('No available options') : __('Select shipping option')}</option>
              {shippingOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {formatPrice(option.rate.amount_decimal)} {option.name} {option.carrier && ` - ${option.carrier}`}
                </option>
              ))}
            </Select>
            {form.processing && (
              <div className="absolute inset-0 flex justify-center items-center">
                <LoadingIcon className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>
        </fieldset>

        <ValidationErrors errors={form.errors} className="mr-3 font-medium max-w-[20rem]" />
      </div>
    </div>
  )
}

export default ShippingOptionSelect
