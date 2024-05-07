import { useState } from 'react'
import { lang as __ } from '@/Hooks/useLang'
import InputLabel from '@/Components/TranslatedInputLabel'
import { router, useForm } from '@inertiajs/react'
import useTypedPage from '@/Hooks/useTypedPage'
import { Address, Order } from '@/types'
import { default as AddressCard } from '@/Components/Address'
import AddressField from '@/Components/AddressField'
import SecondaryButton from '@/Components/Buttons/SecondaryButton'
import { PencilSquareIcon } from '@heroicons/react/24/solid'
import InputError from '@/Components/InputError'
import MessageField from '@/Components/MessageField'
import Price from '@/Components/Price'
import useRoute from '@/Hooks/useRoute'
import { ChatBubbleLeftIcon, TruckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import PrimaryButton from '@/Components/Buttons/PrimaryButton'
import clsx from 'clsx'
import UpdateShippableShippingProfile from './UpdateShippableShippingProfile'
import Heading from '@/Components/TranslatedHeading'
import Modal from '@/Components/Modal'
import useModal from '@/Hooks/useModal'
import ValidationErrors from '@/Components/ValidationErrors'

interface PageProps {
  shippingTotal?: number
  order: Order
  shippingAddress: Address
}

const GetShippingLabelsModal: React.FC = () => {

  const { order, shippingAddress, shippingTotal } = useTypedPage<PageProps>().props,
        shop = order.shop,
        [openForm, setOpenForm] = useState<string|null>(null),
        orderProducts = order.order_products.filter(op => !op.product.is_digital_product).sort((a, b) => a.id - b.id), // Sort by shipping label
        [selectedOrderProduct, setSelectedOrderProduct] = useState(orderProducts[0]),
        [modal, setModal] = useModal('buy-shipping-labels'),
        [processing, setProcessing] = useState(false),
        route = useRoute(),
        handleBuyingShippingLabels = () => {
          setProcessing(true)
          router.post(route('dashboard.shipping-profiles.buy-shipping-labels', [order.number]), {}, {
            onFinish: () => setProcessing(false)
          })
        }

  const notesForm = useForm<{ notes_to_customer: string|null }>({
    notes_to_customer: order.notes_to_customer,
  })

  const handleSubmitNotes = (event: React.FormEvent) => {
    event.preventDefault()
    notesForm.put(route('dashboard.orders.update', [order.number]), {
      preserveScroll: true,
      onSuccess: () => setOpenForm(null)
    })
  }

  return <>

    <PrimaryButton
      as="button"
      size="sm"
      type="button"
      onClick={() => setModal(true)}
    >
      <TruckIcon className="w-4 h-auto -ml-0.5" />
      <span>{__('Get shipping labels')}</span>
    </PrimaryButton>

    <Modal maxWidth="7xl" isOpen={!!modal} onClose={() => setModal(false)}>
      <div className="p-4 space-y-4">

        <Heading title={__('Buy shipping labels for order #:number', {number: order.number})} />

        <div className="md:flex items-stretch gap-x-6">
          <div className="flex-1 flex flex-col">

            <ul className="shrink-0 flex flex-row -mb-px relative z-[1]">
              {orderProducts.map(orderProduct => (
                <li key={orderProduct.id}>
                  <button
                    type="button"
                    disabled={selectedOrderProduct.id === orderProduct.id}
                    onClick={() => setSelectedOrderProduct(orderProduct)}
                    className={clsx([
                      'p-4',
                      'text-left',
                      'border-t',
                      'border-x',
                      'border-transparent',
                      'transition-colors',
                    ], {
                      'site-border site-bg': selectedOrderProduct.id === orderProduct.id,
                      'hover:bg-chrome-400/50': selectedOrderProduct.id !== orderProduct.id
                    })}
                  >
                    <div className="shrink-0 relative" data-tooltip-content={`${orderProduct.product.name} x${orderProduct.quantity}`}>
                      <img src={orderProduct.product.featured_image_url!} className="max-w-full block w-12 aspect-square object-cover object-clip" />
                      <span className="absolute -top-1.5 -right-1.5 text-xs font-semibold rounded-full bg-chrome-900 text-white px-1.5 py-0.5">{orderProduct.quantity}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="-mx-4 md:mr-0 md:-mb-4 p-4 md:border-r border-t site-border h-full">

              {orderProducts.map(orderProduct => (
                <div key={orderProduct.id} className={clsx(orderProduct.id !== selectedOrderProduct.id && 'hidden')}>
                  <UpdateShippableShippingProfile shippable={orderProduct} />
                </div>
              ))}

            </div>
          </div>

          <aside className="shrink-0 w-full md:max-w-sm space-y-6 flex flex-col">

            <dl className="space-y-2">
              <dt className="flex items-center justify-between gap-x-4">
                <InputLabel lang="orders.notes_to_customer" className="whitespace-nowrap" value="Notes to Customer" />
                {openForm !== 'notes' && !order.notes_to_customer ? null : openForm !== 'notes' ? (
                  <SecondaryButton size="xs" type="button" onClick={() => setOpenForm('notes')}>
                    <PencilSquareIcon className="w-3 h-auto -ml-1" aria-hidden="true" />
                    <span>{__('Edit')}</span>
                  </SecondaryButton>
                ) : (
                  <SecondaryButton size="xs" type="button" onClick={() => setOpenForm(null)}>
                    <XMarkIcon className="w-3 h-auto -ml-1" aria-hidden="true" strokeWidth={3} />
                    <span>{__('Cancel')}</span>
                  </SecondaryButton>
                )}
              </dt>
              <dd className="text-sm">
                {openForm !== 'notes' ? (
                  <div className="text-left [&_*]:!font-normal">
                    {order.notes_to_customer ? (
                      <div className="bg-chrome-300/50 p-3 italic">
                        <p>"{order.notes_to_customer}"</p>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setOpenForm('notes')} className="border-2 border-chrome-300 w-full border-dashed p-6 flex justify-center items-center">
                        <SecondaryButton size="sm" as="span">
                          <ChatBubbleLeftIcon className="w-3 h-auto -ml-0.5" strokeWidth={3} aria-hidden="true" />
                          <span>{__('Add Note')}</span>
                        </SecondaryButton>
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitNotes}>
                    <fieldset className="[&_textarea]:!text-sm">
                      <MessageField
                        value={notesForm.data.notes_to_customer || ''}
                        disabled={notesForm.processing}
                        onChange={(event: any) => notesForm.setData('notes_to_customer', event.currentTarget.value)} />
                      <InputError message={notesForm.errors.notes_to_customer} />
                    </fieldset>
                  </form>
                )}
              </dd>
            </dl>

            <dl className="space-y-2">
              <dt className="flex items-center gap-x-4 justify-between">
                <InputLabel lang="orders.dispatches_from" value={'Default Dispatch Address'} disableTranslationsEditor />
                <SecondaryButton size="xs" as="a" target="_blank" href={route('dashboard.order-settings')} >
                  <PencilSquareIcon className="w-3 h-auto -ml-1" aria-hidden="true" />
                  <span>{__('Edit')}</span>
                </SecondaryButton>
              </dt>
              <dd className="text-sm">
                <div className="text-left [&_*]:!font-normal">
                  <AddressCard address={shop.dispatch_address!} />
                </div>
              </dd>
            </dl>

            <OrderShippingAddressForm order={order} shippingAddress={shippingAddress} />

            <div className="flex-1" />

            <div className="p-3.5 bg-chrome-400/50 space-y-4">
              <Heading type="h4" className="text-primary" title={__('Shipping Summary')} />
              <div className="text-sm">
                <div className="flex gap-x-4 justify-between pb-2">
                  <div>{__('Customer paid')}</div>
                  <div></div>
                </div>
                <div className="flex gap-x-4 justify-between pb-2">
                  <div className="pl-4">{__('Shipping')}</div>
                  <div><Price amount={order.shipping} currency={order.currency} /></div>
                </div>
                <div className="flex gap-x-4 justify-between pb-2">
                  <div className="pl-4">{__('Handling')}</div>
                  <div><Price amount={order.handling} currency={order.currency} /></div>
                </div>
                <div className="font-medium flex gap-x-4 justify-between py-2">
                  <div>{__("You will pay")}</div>
                  <div>
                    <Price amount={shippingTotal || 0} currency={order.currency} />
                  </div>
                </div>
              </div>

              <PrimaryButton
                type="button"
                onClick={handleBuyingShippingLabels}
                processing={processing}
                className="py-2 w-full justify-center"
                text={__('Buy Shipping Labels')} />

            </div>

          </aside>
        </div>
      </div>
    </Modal>
  </>
}

const OrderShippingAddressForm: React.FC<{ order: Order, shippingAddress: Address }> = ({ order, shippingAddress }) => {

  const [open, setOpen] = useState(false),
        { supportedShippingCountries } = useTypedPage<{ supportedShippingCountries: {[code: string]: string} }>().props,
        route = useRoute(),
        form = useForm<{ shipping_address: Address }>({
          shipping_address: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            city: shippingAddress.city,
            country: shippingAddress.country,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2,
            postal_code: shippingAddress.postal_code,
            state: shippingAddress.state,
          }
        }),
        handleSubmit = (event: React.FormEvent) => {
          event.preventDefault()
          form.put(route('dashboard.orders.update', [order.number]), {
            preserveScroll: true,
            onSuccess: () => setOpen(false)
          })
        }

  return (
    <dl className="space-y-2">
      <dt className="flex items-center justify-between gap-x-4">
        <InputLabel lang="orders.deliver_to" value="Deliver To" disableTranslationsEditor />
        {!open ? (
          <SecondaryButton size="xs" type="button" onClick={() => setOpen(true)}>
            <PencilSquareIcon className="w-3 h-auto -ml-1" aria-hidden="true" />
            <span>{__('Edit')}</span>
          </SecondaryButton>
        ) : (
          <SecondaryButton size="xs" type="button" onClick={() => setOpen(false)}>
            <XMarkIcon className="w-3 h-auto -ml-1" aria-hidden="true" strokeWidth={3} />
            <span>{__('Cancel')}</span>
          </SecondaryButton>
        )}
      </dt>
      <dd className="text-sm">
        {!open ? (
          <div className="text-left [&_*]:!font-normal">
            {shippingAddress && <AddressCard address={shippingAddress} />}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AddressField
              address={shippingAddress}
              googlePlacesApiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY || null}
              allowedCountries={Object.keys(supportedShippingCountries)}
              onChange={({ name, phone, ...address }) => {
                form.setData('shipping_address', {
                  name: name || '',
                  phone: phone || '',
                  city: address.city,
                  country: address.country,
                  line1: address.line1,
                  line2: address.line2 || '',
                  postal_code: address.postal_code,
                  state: address.state,
                })
              }}
              withPhone />

            <ValidationErrors errors={form.errors} />
            {/* <InputError message={addressErrorMessage(form.errors, ['line1', 'line2', 'postal_code', 'city', 'state', 'country'])} /> */}

            <PrimaryButton
              type="submit"
              size="sm"
              processing={form.processing}
              text={__('Save')} />
          </form>
        )}
      </dd>
    </dl>
  )
}

export default GetShippingLabelsModal
