import os
for i in os.listdir(os.getcwd()):
	print i
	base = os.path.splitext(i)[0]
	os.rename(i, base + ".pdf")