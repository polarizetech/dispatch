import { useEffect, useState } from 'react'
import { lang as __ } from '@/Hooks/useLang'
import { Input } from '@/catalyst-ui/input'
import InputLabel from '@/Components/TranslatedInputLabel'
import InputError from '@/Components/InputError'
import { Select } from '@/catalyst-ui/select'
import Heading from '@/Components/TranslatedHeading'
import { Address, Cart, Customer, ShippingOption, ShippingProfile, Shop } from '@/types'
import useTypedPage from '@/Hooks/useTypedPage'
import useRoute from '@/Hooks/useRoute'
import { useForm } from '@inertiajs/react'
import clsx from 'clsx'
import LoadingIcon from '@/Components/Icons/LoadingIcon'
import PrimaryButton from '@/Components/Buttons/PrimaryButton'

interface PageProps {
  shop: Shop
  currentCart?: Cart|null
  currentCustomer?: Customer|null
  supportedShippingCountries: {[code: string]: string}
}

interface Props {
  shippingProfile: ShippingProfile|null
  shippingAddress?: Address|null
  shippingOption?: ShippingOption|null
  onChange?: (shippingOption: ShippingOption|null) => void
  className?: string
}

const ShippingEstimateForm: React.FC<Props> = ({
  shippingProfile,
  shippingAddress,
  shippingOption,
  onChange,
  ...props
}) => {

  if (!shippingProfile || shippingProfile.custom_rates) {
    return null
  }

  const calculatorMode = shippingAddress === undefined

  const { supportedShippingCountries, shop, currentCart, currentCustomer } = useTypedPage<PageProps>().props,
        currency = shop?.currency || currentCart?.currency,
        form = useForm<{
          country: string|null
          postal_code: string|null
          shipping_option_id: number|null
        }>({
          country: null,
          postal_code: null,
          shipping_option_id: null
        }),
        [handling, setHandling] = useState<number>(0),
        [rate, setRate] = useState<number|null>(null),
        [total, setTotal] = useState<number|null>(null),
        route = useRoute(),
        shippingOptions = shippingProfile?.available_shipping_options || [],
        formatPrice = (price: number) => Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)

  const updateShippingRates = () => {

    if (!form.data.country || !form.data.postal_code) {
      return
    }

    if (
      form.data.country === 'US' &&
      (form.data.postal_code.length < 5 || isNaN(parseInt(form.data.postal_code)))
    ) {
      form.setError('postal_code', __('Please enter a valid ZIP code'))
      return
    }

    if (form.data.country === 'CA' && form.data.postal_code.length < 6) {
      form.setError('postal_code', __('Please enter a valid postal code'))
      return
    }

    form.post(route('dashboard.shipping-profiles.calculate', [shippingProfile]), {
      preserveScroll: true
    })
  }

  useEffect(() => {
    const customerShippingAddress = currentCart?.shipping_address || currentCustomer?.shipping_address
    if (customerShippingAddress) {
      form.setData({
        ...form.data,
        country: customerShippingAddress?.country || null,
        postal_code: customerShippingAddress?.postal_code || null
      })
    }
  }, [])

  useEffect(() => {
    if (shippingOption) {
      form.setData('shipping_option_id', shippingOption.id)
    }
  }, [shippingOption])

  useEffect(() => {
    setHandling(shippingProfile?.handling_fee || 0)
  }, [shippingProfile?.handling_fee])

  useEffect(() => {
    const shippingOption = shippingOptions.find(op => op.id === form.data.shipping_option_id) || null
    setRate(shippingOption?.rate?.amount_decimal || null)
    onChange?.(shippingOption)
  }, [form.data.shipping_option_id])

  useEffect(() => {
    if (rate === null) {
      setTotal(null)
      return
    }
    setTotal(rate + handling)
  }, [handling, rate])

  return (
    <div className={clsx('bg-chrome-400/60 p-4 flex-1', props.className)}>
      <div className="space-y-4">

        {calculatorMode && <>
          <Heading
            type="h4"
            lang="shipping.estimate_shipping_costs"
            title={'Estimate Shipping Costs'} />

          <div className="grid grid-cols-5 gap-x-4">
            <fieldset className="col-span-3 space-y-1">
              <InputLabel value={__('Country')} />
              <Select
                value={form.data.country || ''}
                onChange={(event: any) => form.setData('country', event.currentTarget.value)}
                className="w-full"
              >
                <option disabled value="">{__('Select a country')}</option>
                {Object.entries(supportedShippingCountries).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </Select>
              <InputError message={form.errors.country} />
            </fieldset>

            <fieldset className="col-span-2 space-y-1">
              <InputLabel lang="products.postal_code" value={'Postal Code'} />
              <div className="flex gap-x-2">
                <Input
                  value={form.data.postal_code || ''}
                  onChange={event => form.setData('postal_code', event.target.value)}
                />
              </div>
              <InputError message={form.errors.postal_code} />
            </fieldset>
          </div>
        </>}

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
            <InputError message={form.errors.shipping_option_id} />
          </div>
        </fieldset>

        <div className="flex justify-end">
          <PrimaryButton
            type="button"
            onClick={updateShippingRates}
            processing={form.processing}
            text={__('Update shipping rates')} />
        </div>

        <dl className="ml-auto space-y-4 text-base font-medium">
          {calculatorMode && <>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-sm">{__('Handling Fee')}</dt>
              <dd className="text-sm">
                {formatPrice(handling)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-sm">{__('Shipping Fee')}</dt>
              <dd className="text-sm">
                {rate !== null ? (
                  <>{formatPrice(rate)}</>
                ) : (
                  <span className="italic site-text-muted">{__('Awaiting shipping rate')}</span>
                )}
              </dd>
            </div>
            <div className="border-b site-border pb-4" />
          </>}
          <div className="flex items-center justify-between">
            <dt>
              <InputLabel className="whitespace-nowrap [&_h5]:!font-semibold" lang="shops.total" value="Total" disableTranslationsEditor />
            </dt>
            <dd className="text-sm">
              {total !== null ? (
                <span className="font-semibold">{formatPrice(total)}</span>
              ) : (
                <span className="italic site-text-muted">{__('Awaiting shipping rate')}</span>
              )}
            </dd>
          </div>
        </dl>

      </div>
    </div>
  )
}

export default ShippingEstimateForm
