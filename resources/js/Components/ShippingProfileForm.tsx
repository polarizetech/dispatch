import { useEffect, useState } from 'react'
import { lang as __ } from '@/Hooks/useLang'
import { Input } from '@/catalyst-ui/input'
import InputLabel from '@/Components/TranslatedInputLabel'
import InputError from '@/Components/InputError'
import { Select } from '@/catalyst-ui/select'
import useTypedPage from '@/Hooks/useTypedPage'
import { Forms, ShippingProfile, Shop } from '@/types'
import Toggle from '@/Components/Toggle'
import Checkbox from '@/Components/Checkbox'
import Multiselect, { MultiselectOption } from '@/Components/Multiselect'
import useRoute from '@/Hooks/useRoute'
import { Link, useForm } from '@inertiajs/react'
import AddressField from '@/Components/AddressField'
import Address from '@/Components/Address'
import clsx from 'clsx'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Props {
  shippingProfile: ShippingProfile|null
  onChange: (data: Forms.ShippingProfileFormData) => void
  buyShippingLabels?: boolean
  className?: string
}

interface PageProps {
  shop: Shop
  dispatchOptions: string[]
  shippingProfiles: ShippingProfile[]
  supportedShippingCountries: {[code: string]: string}
  errors: {shippingProfileData: {[key: string]: string}}
}

const ShippingProfileForm: React.FC<Props> = ({ shippingProfile, onChange, ...props }) => {

  const { shop, supportedShippingCountries, dispatchOptions, errors } = useTypedPage<PageProps>().props

  const formErrors = errors.shippingProfileData || {}

  const form = useForm<any>({
          weight: shippingProfile?.weight,
          weight_unit: shippingProfile?.weight_unit || 'lb',
          width: shippingProfile?.width,
          height: shippingProfile?.height,
          length: shippingProfile?.length,
          length_unit: shippingProfile?.length_unit || 'in',
          free_shipping_international: shippingProfile?.free_shipping_international || false,
          free_shipping_domestic: shippingProfile?.free_shipping_domestic || false,
          delivers_to: shippingProfile?.delivers_to,
          dispatch_period: shippingProfile?.dispatch_period,
          handling_fee: shippingProfile?.handling_fee_decimal,
          dispatch_address_data: shippingProfile?.dispatch_address,
        }),
        handleChange = (event: any) => form.setData(event.target.name, event.target.value),
        hasFreeShipping = form.data.free_shipping_international === true && form.data.free_shipping_domestic === true

  const route = useRoute(),
        buyShippingLabels = route().current('dashboard.orders.show'),
        [useCustomDispatchAddress, setUseCustomDispatchAddress] = useState<boolean>(false)

  useEffect(() => {
    if (!form.isDirty) {
      return
    }
    onChange(form.data)
  }, [form.data])

  useEffect(() => {

    setUseCustomDispatchAddress(!!shippingProfile?.dispatch_address)

    if (!shippingProfile) {
      form.reset()
      return
    }

    form.setData({
      ...form.data,
      ...shippingProfile,
      handling_fee: shippingProfile?.handling_fee_decimal || form.data.handling_fee || null,
      dispatch_address_data: shippingProfile?.dispatch_address,
    })

  }, [shippingProfile])

  return (
    <div className={clsx('space-y-6', props.className)}>

      {!buyShippingLabels && <>
        <fieldset className="space-y-1">
          <InputLabel lang="products.where_we_will_deliver" value="Where We'll Deliver" />
          <div className="flex items-start gap-x-4">
            <div className="flex items-center gap-x-2">
              <Checkbox
                label={__('products.everywhere', {}, 'Everywhere')}
                type="radio"
                checked={form.data.delivers_to === null}
                onChange={event => form.setData('delivers_to', event.target.checked ? null : [])} />
            </div>
            <div className="flex items-center gap-x-2">
              <Checkbox
                label={__('products.select_countries', {}, 'Select Countries')}
                type="radio"
                checked={form.data.delivers_to !== null}
                onChange={event => form.setData('delivers_to', event.target.checked ? Object.keys(supportedShippingCountries) : null)} />
            </div>
          </div>
          {form.data.delivers_to !== null && (
            <Multiselect
              values={form.data.delivers_to?.map((val: string) => ({ value: val, label: supportedShippingCountries[val] }))}
              options={Object.entries(supportedShippingCountries).map(([code, name]) => ({ value: code, label: name }))}
              onChange={(selectedOptions: MultiselectOption[]) => form.setData('delivers_to', selectedOptions.map(op => op.value))} />
          )}
          <InputError message={formErrors.delivers_to} />
        </fieldset>

        <div className="space-y-1">
          <InputLabel lang="products.dispatch_period" value="Dispatch Period" />
          <div className="flex items-start gap-x-4">
            <fieldset className="flex items-center gap-x-2">
              <Checkbox
                label={__('products.ready_to_dispatch', {}, 'Ready to dispatch')}
                type="radio"
                checked={form.data.dispatch_period === null}
                onChange={event => form.setData('dispatch_period', event.target.checked ? null : 0 )} />
            </fieldset>
            <fieldset className="flex items-center gap-x-2">
              <Checkbox
                label={__('products.made_to_order', {}, 'Made to order')}
                type="radio"
                checked={form.data.dispatch_period !== null}
                onChange={event => form.setData('dispatch_period', event.target.checked ? 0 : null )} />
            </fieldset>
          </div>
          {form.data.dispatch_period !== null && (
            <Select
              value={form.data.dispatch_period}
              name="dispatch_period"
              onChange={handleChange}
            >
              {dispatchOptions.map((option, index) => (
                <option key={index} value={index}>{__('Dispatches in :dispatchPeriod days', { dispatchPeriod: option })}</option>
              ))}
            </Select>
          )}
          <InputError message={formErrors.dispatch_period} />
        </div>

        <div className="flex flex-row md:items-start gap-x-4">

          <fieldset className="space-y-1 flex-1">
            <InputLabel lang="products.free_shipping" value="Free Shipping" />
            <div className="flex items-start gap-x-4 pt-1.5">
              <div>
                <Toggle
                  label={__('products.domestic', {}, 'Domestic')}
                  enabled={form.data.free_shipping_domestic}
                  onChange={enabled => form.setData('free_shipping_domestic', enabled)}
                />
                <InputError message={formErrors.free_shipping_domestic} />
              </div>
              <div>
                <Toggle
                  label={__('products.international', {}, 'International')}
                  enabled={form.data.free_shipping_international}
                  onChange={enabled => form.setData('free_shipping_international', enabled)}
                />
                <InputError message={formErrors.free_shipping_international} />
              </div>
            </div>
          </fieldset>

          {!hasFreeShipping && (
            <fieldset className="space-y-1">
              <InputLabel lang="products.handling_fee"  value="Handling Fee" />
              <div className="relative">
                <span className="pointer-events-none opacity-60 leading-none z-[1] absolute inset-y-0 flex items-center pl-3 left-0">
                  {shop.currency.toUpperCase()+'$'}
                </span>
                <Input
                  type="number"
                  name="handling_fee"
                  className="[&_input]:pl-14 w-full max-w-[10rem]"
                  value={form.data.handling_fee || ''}
                  onChange={event => form.setData('handling_fee', parseInt(event.target.value))} />
              </div>
              <InputError message={formErrors.handling_fee} />
            </fieldset>
          )}

        </div>
      </>}

      <div className="flex flex-row md:items-start gap-x-4">
        <fieldset className="space-y-1">
          <InputLabel lang="products.weight" value="Weight" />
          <div className="max-w-[10rem]">
            <Input
              type="number"
              name="weight"
              min={0}
              required
              className="w-full"
              value={form.data.weight || ''}
              onChange={handleChange} />
          </div>
          <InputError overlay message={formErrors.weight} />
        </fieldset>

        <fieldset className="space-y-1">
          <InputLabel lang="products.weight_units" value="Units" />
          <Select
            value={form.data.weight_unit}
            name="weight_unit"
            onChange={handleChange}
            className="min-w-[4.5rem]"
          >
            <option value={'lb'}>{'lb'}</option>
            <option value={'kg'}>{'kg'}</option>
          </Select>
          <InputError overlay message={formErrors.weight_unit} />
        </fieldset>
      </div>

      <div className="flex flex-row md:items-start gap-x-4">

        <fieldset className="space-y-1">
          <InputLabel lang="products.width" value="Width" />
          <div className="relative max-w-[10rem]">
            <Input
              type="number"
              name="width"
              min={0}
              className="w-full"
              value={form.data.width || ''}
              onChange={handleChange} />
          </div>
          <InputError overlay message={formErrors.width} />
        </fieldset>

        <fieldset className="space-y-1">
          <InputLabel lang="products.height" value="Height" />
          <div className="relative max-w-[10rem]">
            <Input
              type="number"
              name="height"
              min={0}
              className="w-full"
              value={form.data.height || ''}
              onChange={handleChange} />
          </div>
          <InputError overlay message={formErrors.height} />
        </fieldset>

        <fieldset className="space-y-1">
          <InputLabel lang="products.length" value="Length" />
          <div className="relative max-w-[10rem]">
            <Input
              type="number"
              name="length"
              min={0}
              className="w-full"
              value={form.data.length || ''}
              onChange={handleChange} />
          </div>
          <InputError overlay message={formErrors.length} />
        </fieldset>

        <fieldset className="space-y-1">
          <InputLabel lang="products.length_units" value="Units" />
          <Select
            value={form.data.length_unit}
            name="length_unit"
            onChange={handleChange}
            className="min-w-[4.5rem]"
          >
            <option value={'in'}>{'in'}</option>
            <option value={'cm'}>{'cm'}</option>
          </Select>
          <InputError overlay message={formErrors.length_unit} />
        </fieldset>
      </div>

      <fieldset className="space-y-1">
        <div className="flex items-center">
          <InputLabel
            lang="products.address_id"
            value={'Dispatch Address'} />
        </div>

        <Select
          name="shipping_profile_id"
          value={useCustomDispatchAddress ? '1' : '0'}
          className="w-full"
          onChange={event => {
            const useCustomDispatchAddress = event.target.value === '1'
            setUseCustomDispatchAddress(useCustomDispatchAddress)
            if (!useCustomDispatchAddress) {
              form.setData('dispatch_address_data', null)
            }
          }}
        >
          <option value="0">{__('Use default dispatch address')}</option>
          <option value="1">{__('Use custom dispatch address')}</option>
        </Select>

        {! useCustomDispatchAddress ? (
          <div className="pt-4">
            <Address className="text-sm" address={shop.dispatch_address!} />
            <Link as="a" target="_blank" href={route('dashboard.order-settings')} className="group site-link text-sm font-medium">
              {'('}<span className="underline group-hover:no-underline">{__('Edit default dispatch address')}</span>{')'}
            </Link>
          </div>
        ) : (
          <div className="pt-4">
            <AddressField
              address={shippingProfile?.dispatch_address || undefined}
              googlePlacesApiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY || null}
              allowedCountries={Object.keys(supportedShippingCountries)}
              onChange={(address) => {
                form.setData('dispatch_address_data', address)
              }}
              withPhone />
          </div>
        )}

        <InputError message={formErrors.dispatch_address_data} />
      </fieldset>

    </div>
  )
}

export default ShippingProfileForm
