"""
Hello World Plugin for Extism using Python

This is a simple example of an Extism plugin written in Python.
"""

from extism_pdk import host

def hello():
    """
    A simple hello function that returns a greeting
    
    Returns:
        int: 0 for success, non-zero for error
    """
    # Get input from host
    input_text = host.get_input_string()
    if not input_text:
        input_text = "World"
    
    # Log debug message
    host.log_debug(f"Hello plugin called with input: {input_text}")
    
    # Create greeting
    greeting = f"Hello, {input_text}! This is an Extism plugin written in Python."
    
    # Set output
    host.set_output_string(greeting)
    
    # Return success
    return 0 