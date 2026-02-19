import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_classify():
    print("--- Testing Problem Classification ---")
    url = f"{BASE_URL}/classify"
    payload = {
        "title": "Climbing Stairs",
        "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")
        if response:
             print(response.text)

def test_analyze():
    print("\n--- Testing Code Analysis ---")
    url = f"{BASE_URL}/analyze"
    # Testing a brute force solution against an expected Hash Map solution (Two Sum)
    payload = {
        "expectedOptimal": "HASHMAP", 
        "language": "java",
        "rawCode": """
        class Solution { 
            public int[] twoSum(int[] nums, int target) { 
                for(int i=0; i<nums.length; i++) { 
                    for(int j=i+1; j<nums.length; j++) { 
                        if(nums[i]+nums[j] == target) 
                            return new int[]{i,j}; 
                    } 
                } 
                return new int[]{}; 
            } 
        }""",
        "mistakeCount": 1
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")
        if response:
             print(response.text)

if __name__ == "__main__":
    test_classify()
    test_analyze()