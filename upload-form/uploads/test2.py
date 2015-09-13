
def shiftText(shift_text, shift_amount, direction):
	data = []
	if direction == 'right':
		for i in shift_text:
			i = i + shift_amount
			print i + '\n'
shiftText('my name is noah', 6, 'right')

    	

