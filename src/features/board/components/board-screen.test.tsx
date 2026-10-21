import { screen } from '@testing-library/react'
import { renderWithQueryClient, stubMondayApi } from '@/testing/test-utils'
import { BoardScreen } from './board-screen'

afterEach(() => vi.unstubAllGlobals())

describe('BoardScreen', () => {
  it('explains how to open it as a board view when it runs anywhere else', () => {
    const fetchMock = stubMondayApi({})

    renderWithQueryClient(<BoardScreen instanceType="item_view" boardId="42" />)

    expect(screen.getByText(/meant to run as a board view/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows the name of the board it is on', async () => {
    stubMondayApi({ boards: [{ id: '42', name: 'Q4 Roadmap' }] })

    renderWithQueryClient(<BoardScreen instanceType="board_view" boardId="42" />)

    expect(await screen.findByRole('heading', { name: 'Q4 Roadmap' })).toBeInTheDocument()
  })

  it('asks for a test board id in local dev when there is none', () => {
    renderWithQueryClient(<BoardScreen instanceType="board_view" boardId={undefined} />)

    expect(screen.getByText(/VITE_DEV_BOARD_ID/)).toBeInTheDocument()
  })
})
