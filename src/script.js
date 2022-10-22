window.browserChoices = []

document.getElementById('submit').addEventListener('click',  () => {
  document.querySelector('.selected-browsers').childNodes.forEach((e) => { window.browserChoices.push(e.firstChild.innerText) })
  console.debug('submit')  
})

window.addEventListener('click', (e) => {
  if (e.target.closest('.remove')) {
    e.target.closest('.tag').remove()
  }
})

document.getElementById('add').addEventListener('click', () => {
  const selection = document.querySelector('#browserType select').value
  const tag = document.createElement('div')
  const text = document.createElement('span')
  const remove = document.createElement('span')
  tag.classList.add('tag')
  remove.classList.add('remove')
  text.innerText = selection
  tag.appendChild(text)
  tag.appendChild(remove)
  document.querySelector('.selected-browsers').appendChild(tag)
})