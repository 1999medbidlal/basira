import re
import cv2

def read_custum_html(file_name):
    with open(file_name) as f:
        return f.read()

def get_lines(result):
    if not result:
        return {}
        
    lines_dict = {}
    l = 0
    lines_dict[0] = []
    cord = result[0][0]
    x_min, y_min = [int(min(idx)) for idx in zip(*cord)]
    x_max, y_max = [int(max(idx)) for idx in zip(*cord)]
    lines_dict[0].append([[x_max, y_min], result[0][1]])
    y_min_prev = lines_dict[0][0][0][1]
    
    for i in range(1, len(result)):
        cord = result[i][0]
        x_min, y_min = [int(min(idx)) for idx in zip(*cord)]
        x_max, y_max = [int(max(idx)) for idx in zip(*cord)]
        if y_min - y_min_prev < 18:
            lines_dict[l].append([[x_max, y_min], result[i][1]])
            y_min_prev = y_min
        else:
            l += 1
            lines_dict[l] = []
            lines_dict[l].append([[x_max, y_min], result[i][1]])
            y_min_prev = y_max
    return lines_dict

def annotate_image(image, result): 
    for i in range(len(result)):
        cord = result[i][0]
        x_min, y_min = [int(min(idx)) for idx in zip(*cord)]
        x_max, y_max = [int(max(idx)) for idx in zip(*cord)]
        cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (0, 0, 255), 1)
    return image

def arrange_words_in_line(lines_dict):
    if isinstance(lines_dict, dict):
        arranged_dict = {}
        for key, values in lines_dict.items():
            line = lines_dict[key]
            # Reverse sort x-coordinates for right-to-left Arabic text flow
            sorted_line = sorted(line, key=lambda x: x[0][0], reverse=True)
            arranged_dict[key] = sorted_line
        return arranged_dict
    else:
        raise TypeError("The arg must be dict of lines")

def replace_ar_to_en_num(text):
    """Converts Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) to Western numerals (0123456789)."""
    eastern_digits = '٠١٢٣٤٥٦٧٨٩'
    western_digits = '0123456789'
    translation_table = str.maketrans(eastern_digits, western_digits)
    return text.translate(translation_table)

def get_raw_text(result):
    if not result:
        return ""
        
    lines_dict = get_lines(result)
    arranged_lines_dict = arrange_words_in_line(lines_dict)
    
    lines_text = []
    for i in range(len(arranged_lines_dict)):
        # Join words in the current line with a space
        line_words = [item[1] for item in arranged_lines_dict[i]]
        line_str = ' '.join(line_words)
        lines_text.append(line_str)
        
    # Join all lines with newlines
    raw_text = '\n'.join(lines_text)
    
    # Convert Eastern Arabic numbers to Western numbers
    raw_text = replace_ar_to_en_num(raw_text)
    return raw_text