import { cn } from '@/utils/utils'
import { useState } from 'react'
import { Toaster } from './Sonner'

import { toast } from "sonner"

const ReactContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = import.meta.env.PUBLIC_BASE_URL
    const token = import.meta.env.PUBLIC_TOKEN

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: token,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()

        console.log(data)

        // Display success toast
        toast.success(`Thank you, ${data[0].name} (${data[0].email}), for contacting me!`, {
          description: `I'll get back to you soon.`,
        })

        // Clear form data
        setFormData({ name: '', email: '', message: '' })
      } else {
        // Display error toast
        toast.error("Error submitting form. Please try again later.")
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error("Error submitting form. Please try again later.")
    }
  }
  return (
    <>
      <Toaster richColors position="top-right" />
      <section className="scroll-mt-[72px]">
        <div
          className={cn(
            'relative px-4 md:px-6 py-12 md:py-16 lg:py-20 text-default dark max-w-5xl mx-auto'
          )}
        >
          <div
            className="flex flex-col w-full max-w-xl p-8 m-auto rounded-lg"
            style={{
              backgroundColor: 'var(--contrast)',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="w-full mb-4 md:mx-auto md:mb-4 text-center">
              <h2 className="text-lg text-primary font-bold">
                Drop a message now!
              </h2>
              <h3 className="lg:text-4xl text-2xl font-bold">
                Contact Me
              </h3>
              <p className="mt-4 text-muted">
                Reach out to me with any inquiries, concerns, or questions.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-muted">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="py-3 px-4 block w-full text-md rounded-lg border border-border dark:border-border bg-page dark:bg-page"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-muted">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="py-3 px-4 block w-full text-md rounded-lg border border-border dark:border-border bg-page dark:bg-page"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-muted">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  placeholder=""
                  value={formData.message}
                  onChange={handleChange}
                  className="py-3 px-4 block w-full text-md rounded-lg border border-border dark:border-border bg-page dark:bg-page bg-opacity-25"
                ></textarea>
              </div>
              <div className="flex justify-center">
                <button className="btn-primary" type="submit">
                  Send
                </button>
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm text-muted dark:text-muted">
                  I typically respond within 24 hours.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default ReactContactForm
