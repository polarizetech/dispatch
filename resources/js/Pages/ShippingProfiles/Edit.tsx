import useTypedPage from '@/Hooks/useTypedPage'
import { Address, ShippingCarrier, ShippingOption, ShippingProfile, Shop } from '@/types'
import { lang as __ } from '@/Hooks/useLang'
import { useForm } from '@inertiajs/react'
import useRoute from '@/Hooks/useRoute'
import OrdersTabLayout from '@/Pages/Dashboard/Orders/Partials/OrdersTabLayout'
import InputLabel from '@/Components/TranslatedInputLabel'
import { Input } from '@/catalyst-ui/input'
import InputError from '@/Components/InputError'
import ActionMessage from '@/Components/ActionMessage'
import PrimaryButton from '@/Components/Buttons/PrimaryButton'
import FormSection from '@/Components/FormSection'
import { Select } from '@/catalyst-ui/select'
import { Disclosure } from '@headlessui/react'
import Heading from '@/Components/TranslatedHeading'
import { ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Toggle from '@/Components/Toggle'
import EmptyState from '@/Components/EmptyState'
import SecondaryButton from '@/Components/Buttons/SecondaryButton'
import ShippingProfileForm from '@dispatch/Components/ShippingProfileForm'
import ShippingEstimateForm from '@dispatch/Components/ShippingEstimateForm'

interface PageProps {
  shop: Shop
  shippingProfile: ShippingProfile
  shippingOptionsByCarrier: Array<ShippingCarrier & { options: ShippingOption[] }>
}

interface FormData {
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
  dispatch_address_data?: Address|null
  automatic_shipping_option_ids: number[]
  custom_shipping_option_data: {
    id: number|null
    name: string|null
    rate_amount: number|null
    rate_delivery_days: number|null
  }[]
}

const Edit: React.FC = () => {

  const { shop, shippingProfile, shippingOptionsByCarrier } = useTypedPage<PageProps>().props,
        form = useForm<FormData>({
          name: shippingProfile.name || null,
          weight: shippingProfile.weight,
          weight_unit: shippingProfile.weight_unit || 'lb',
          width: shippingProfile.width,
          height: shippingProfile.height,
          length: shippingProfile.length,
          length_unit: shippingProfile.length_unit || 'in',

          handling_fee: shippingProfile.handling_fee_decimal,
          delivers_to: shippingProfile.delivers_to,
          dispatch_period: shippingProfile.dispatch_period,
          free_shipping_international: shippingProfile.free_shipping_international,
          free_shipping_domestic: shippingProfile.free_shipping_domestic,

          dispatch_address_data: shippingProfile.dispatch_address,

          custom_rates: shippingProfile.custom_rates,
          automatic_shipping_option_ids: shippingProfile.automatic_shipping_options.map(option => option.id),
          custom_shipping_option_data: shippingProfile.custom_shipping_options.map(option => ({
            id: option.id,
            name: option.name,
            rate_amount: option.rate?.amount_decimal,
            rate_delivery_days: option.rate?.delivery_days
          }))
        }),
        route = useRoute(),
        updateShippingProfile = () => {
          form.put(route('dashboard.shipping-profiles.update', [shippingProfile]), {
            preserveScroll: true,
          })
        }

        const handleAddCustomOption = () => {
          form.setData('custom_shipping_option_data', [
            ...(form.data.custom_shipping_option_data || []),
            { id: null, name: '', rate_amount: 0, rate_delivery_days: null }
          ] as any)
        }

        const handleChangeCustomOption = (event: any) => {
          const [index, name] = event.target.name.split('.')
          let options = (form.data.custom_shipping_option_data || []) as any
          options[index][name] = event.target.value
          form.setData('custom_shipping_option_data', options)
        }

        const removeCustomOption = (index: number) => {
          form.setData('custom_shipping_option_data', (form.data.custom_shipping_option_data || []).filter((_, opIdx) => opIdx !== index))
        }

        const handleToggleAutomaticShippingOption = (checked: boolean, id: number) => (
          form.setData('automatic_shipping_option_ids', (
            (form.data.automatic_shipping_option_ids!.filter((opId: number) => opId !== id) || [])
              .concat(checked ? [id] : [])
          ))
        )

  return (
    <OrdersTabLayout title={__('Edit Shipping Profile')}>
      <div className="[&_.md\:grid]:!block [&_.md\:grid]:!space-y-4 overflow-hidden space-y-10">
        <FormSection
          onSubmit={updateShippingProfile}
          title={__('Edit Shipping Profile', { name: form.data.name || '' })}
          renderActions={() => (
            <>
              <ActionMessage on={form.recentlySuccessful} className="mr-3">
                {__('Saved')}
              </ActionMessage>

              <PrimaryButton
                disabled={form.processing}
                text={__('Save')} />
            </>
        )}>
          <div className="col-span-6">
            <div className="flex items-stretch gap-8">
              <div className="flex-1 space-y-6">

                <fieldset className="space-y-1 max-w-lg">
                  <InputLabel lang="shipping_profiles.name" value="Shipping Profile Name" />
                  <Input
                    value={form.data.name || ''}
                    onChange={event => form.setData('name', event.target.value)}
                    className="w-full" />
                  <InputError message={form.errors.name} />
                </fieldset>

                <ShippingProfileForm
                  shippingProfile={shippingProfile}
                  onChange={data => (
                    form.setData({
                      ...form.data,
                      ...data
                    })
                  )} />

              </div>

              <aside className="flex-1 space-y-4">
                <div className="bg-chrome-400/50 space-y-6 p-4">

                  <fieldset className="space-y-1">
                    <InputLabel lang="products.custom_rates" value={'How shipping rates are calculated'} />
                    <Select
                      value={form.data.custom_rates ? '1' : '0'}
                      name="custom_rates"
                      onChange={event => form.setData('custom_rates', event.target.value === '1')}
                    >
                      <option value={'0'}>{__('Automatically')}</option>
                      <option value={'1'}>{__('Fixed Rates')}</option>
                    </Select>
                    <InputError message={form.errors.custom_rates} />
                  </fieldset>

                  {form.data.custom_rates && (form.data.custom_shipping_option_data || []).length === 0 ? (
                    <EmptyState
                      title={__('No rates yet...')}
                      onClick={handleAddCustomOption}
                      buttonText={__('Add a rate')} />
                  ) : form.data.custom_rates && (
                    <div>
                      <ul className="divide-y site-divide border site-border">
                        <li className="grid grid-cols-7 gap-x-4">
                          <h4 className="px-2 py-1 col-span-2 font-semibold text-sm">{__('Name')}</h4>
                          <h4 className="px-2 py-1 col-span-2 font-semibold text-sm">{__('Rate')}</h4>
                          <h4 className="px-2 py-1 col-span-2 font-semibold text-sm">{__('Delivery Days')}</h4>
                          <span></span>
                        </li>
                        {(form.data.custom_shipping_option_data || []).map((option, index) => (
                          <li key={index} className="grid grid-cols-7 items-center gap-x-4">
                            <fieldset className="px-2 py-1 col-span-2 space-y-1">
                              <Input
                                value={option.name || ''}
                                name={`${index}.name`}
                                onChange={handleChangeCustomOption}
                                className="w-full" />
                              <InputError message={(form.errors as any)[`custom_shipping_option_data.${index}.name`]} />
                            </fieldset>
                            <fieldset className="px-2 py-1 col-span-2 space-y-1">
                              <div className="relative">
                                <span className="pointer-events-none opacity-60 leading-none z-[1] absolute inset-y-0 flex items-center pl-3 left-0">
                                  {shop.currency.toUpperCase()+'$'}
                                </span>
                                <Input
                                  type="number"
                                  name={`${index}.rate_amount`}
                                  className="[&_input]:pl-14 w-full max-w-[10rem]"
                                  value={(form.data.custom_shipping_option_data || [])[index]?.rate_amount || ''}
                                  onChange={handleChangeCustomOption} />
                              </div>
                              <InputError message={(form.errors as any)[`custom_shipping_option_data.${index}.rate_amount`]} />
                            </fieldset>
                            <fieldset className="px-2 py-1 col-span-2 space-y-1">
                              <Input
                                type="number"
                                name={`${index}.rate_delivery_days`}
                                className="[&_input]:pl-14 w-full max-w-[10rem]"
                                value={(form.data.custom_shipping_option_data || [])[index]?.rate_delivery_days || ''}
                                onChange={handleChangeCustomOption} />
                              <InputError message={(form.errors as any)[`custom_shipping_option_data.${index}.rate_delivery_days`]} />
                            </fieldset>
                            <div className="px-2 py-1 flex justify-end">
                              <SecondaryButton
                                type="button"
                                className="border-none hover:bg-chrome-500 !p-2"
                                onClick={() => removeCustomOption(index)}
                              >
                                <TrashIcon className="size-4" />
                              </SecondaryButton>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-end pt-4">
                        <PrimaryButton
                          type="button"
                          onClick={handleAddCustomOption}
                          text={__('Add Option')} />
                      </div>
                    </div>
                  )}

                  {form.data.custom_rates === false && (
                    <ul className="space-y-3">
                      {shippingOptionsByCarrier.map(carrier => (
                        <Disclosure as="div" key={carrier.id} className="border site-border py-1 px-2">
                          {({ open }) => (
                            <>
                              <dt>
                                <Disclosure.Button className="flex w-full items-center text-left gap-x-3">
                                  <img src={carrier.icon} alt={carrier.name} className="size-5 shrink-0" />
                                  <Heading type="h4" className="flex-1" title={carrier.name} />
                                  <span className="text-sm font-semibold">
                                    {form.data.automatic_shipping_option_ids!.filter(id => carrier.options.map(op => op.id).includes(id)).length || 0} / {carrier.services?.length} {__('options')}
                                  </span>
                                  <span className={clsx(open && 'rotate-180', 'transition relative flex h-7 items-center')}>
                                    <ChevronUpIcon className="size-5" aria-hidden="true" />
                                  </span>
                                </Disclosure.Button>
                              </dt>
                              <Disclosure.Panel as="dd">
                                <ul className="pl-0.5 space-y-2 pb-1 pt-2 overflow-y-scroll">
                                  {carrier.options.map(option => (
                                    <li key={option.id} className="space-y-1">
                                      <fieldset className="hover:cursor-pointer text-sm font-medium items-center inline-flex gap-x-1.5">
                                        <Toggle
                                          enabled={!!form.data.automatic_shipping_option_ids!.includes(option.id)}
                                          onChange={enabled => handleToggleAutomaticShippingOption(enabled, option.id)}
                                          label={option.name_formatted}
                                        />
                                      </fieldset>
                                    </li>
                                  ))}
                                </ul>
                              </Disclosure.Panel>
                            </>
                          )}
                        </Disclosure>
                      ))}
                    </ul>
                  )}

                </div>

              </aside>

            </div>
          </div>
        </FormSection>
      </div>
    </OrdersTabLayout>
  )
}

export default Edit
