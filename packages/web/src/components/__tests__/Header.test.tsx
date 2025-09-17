import { render, screen } from '@testing-library/react'
import { Header } from '../Header'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('Header Component', () => {
  it('renders without crashing', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the logo', () => {
    render(<Header />)
    const logo = screen.getByText(/poker tracker/i)
    expect(logo).toBeInTheDocument()
  })

  it('has proper navigation structure', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('Statistics')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders login link', () => {
    render(<Header />)
    expect(screen.getByText('Log in')).toBeInTheDocument()
  })
})
