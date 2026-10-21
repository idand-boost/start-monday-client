import { screen } from '@testing-library/react'
import { renderWithQueryClient, stubMondayApi } from '@/testing/test-utils'
import { ItemScreen } from './item-screen'

afterEach(() => vi.unstubAllGlobals())

describe('ItemScreen', () => {
  it('explains how to open it as an item view when it runs anywhere else', () => {
    const fetchMock = stubMondayApi({})

    renderWithQueryClient(<ItemScreen instanceType="board_view" itemId={undefined} />)

    expect(screen.getByText(/meant to run as an item view/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows the item it is on, and its board', async () => {
    stubMondayApi({ items: [{ id: '7', name: 'Launch the website', board: { id: '42', name: 'Q4 Roadmap' } }] })

    renderWithQueryClient(<ItemScreen instanceType="item_view" itemId="7" />)

    expect(await screen.findByRole('heading', { name: 'Launch the website' })).toBeInTheDocument()
    expect(screen.getByText('Q4 Roadmap')).toBeInTheDocument()
  })

  it('asks for a test item id in local dev when there is none', () => {
    renderWithQueryClient(<ItemScreen instanceType="item_view" itemId={undefined} />)

    expect(screen.getByText(/VITE_DEV_ITEM_ID/)).toBeInTheDocument()
  })
})
