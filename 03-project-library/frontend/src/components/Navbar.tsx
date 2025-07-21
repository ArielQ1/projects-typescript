export function Navbar () {
  return (
    <nav className='bg-neutral-700 p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-white text-lg font-bold'>Ariel's Library</h1>
        <ul className='flex space-x-4 text-sm'>
          <li><a href='#' className='text-white hover:underline'>Repository</a></li>
          <li><a href='#' className='text-white hover:underline'>Git Hub</a></li>
        </ul>
      </div>
    </nav>
  )
}
