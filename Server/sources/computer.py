
import time as __module__time
import sys  as __module__sys

speed = 1

here = 0
front = 1
right = 2
back = 3
left = 4
up = 5
down = 6

def __send(msg, delay=(0.2+1/speed)):
    __module__sys.stdout.flush()
    __module__time.sleep(0.05)
    print("$$" + msg)
    __module__sys.stdout.flush()
    if (speed <=0):
        raise ValueError("Invalid Speed Value")
    __module__time.sleep(delay)


def go(dir=front):
    if dir not in range(7):
        raise ValueError("Invalid Direction")
    if get(dir):
        raise ValueError("Block in place")
    __send("go" + str(dir))

def turn(dir):
    if (dir == right):
        __send("tr")
    elif (dir == left):
        __send("tl")

def get(dir):
    if dir not in range(7):
        raise ValueError("Invalid Direction")
    __send("gt" + str(dir), 0)
    return input() == "t"

def mine(dir):
    if dir not in range(7):
        raise ValueError("Invalid Direction")
    __send("mn" + str(dir), 0.2)

def put(dir, id=1):
    if get(dir):
        raise ValueError("Block in place")
    if dir not in range(7):
        raise ValueError("Invalid Direction")
    __send("pt" + str(dir) + str(id), 0.2)
