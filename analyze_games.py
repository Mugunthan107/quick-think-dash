import os
import re

files = [
    'AptiRush.tsx', 'BubbleGame.tsx', 'CrossMathGame.tsx', 'MirrorImageGame.tsx',
    'MotionChallenge.tsx', 'NumberPuzzleGame.tsx', 'NumberSeriesGame.tsx',
    'NumLinkGame.tsx', 'ThugOfWar.tsx', 'WaterColorSortGame.tsx', 'WaterImageGame.tsx'
]

for f in files:
    try:
        path = 'src/pages/' + f
        with open(path, 'r', encoding='utf-8') as file:
            c = file.read()
            m = re.search(r'<Link.*?to=.*?/.*?>', c)
            chevron = re.search(r'<ChevronLeft\b.*?>', c)
            
            endgame = re.search(r'import.*?addCompletedGame.*?;?', c)
            
            print(f'{f}: Link={m is not None}, Chevron={chevron is not None}, Context={endgame is not None}')
    except Exception as e:
        print(f'{f} error: {e}')
