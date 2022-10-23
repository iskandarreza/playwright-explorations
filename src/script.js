window.browserChoices = []

document.getElementById('submit').addEventListener('click',  () => {
  let isValid = false
  document.querySelector('.selected-browsers').childNodes.forEach((e) => { window.browserChoices.push(e.firstChild.innerText) })
  if (window.browserChoices.length > 0){
    isValid = true
  } else {
    document.getElementById('browserType').classList.add('has-error')
    isValid = false
  }
  if (document.querySelector('#startUrl input').value) {
    isValid = true
  } else {
    isValid = false
    document.getElementById('startUrl').classList.add('has-error')
  }
  if (isValid) {
    console.debug('submit')  
  }
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

document.querySelector('#viewport label').addEventListener('click', () => {
  if (document.querySelector('#viewport input').checked) {
    document.querySelector('#viewport .form-group').setAttribute('style', 'display: unset')
  } else {
    document.querySelector('#viewport .form-group').setAttribute('style', 'display: none')
  }
})