const INDEX = 'emem_persons';

const search = async (query) => {
    const response = await fetch(`https://94abc9318c712977e8c684628aa5ea0f.us-east-1.aws.found.io/${INDEX}/_search?size=10000&from=0`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic cmVhZGVyOnJlYWRlcg==',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query),
        mode: 'no-cors'
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};

const query = {
    query: {
        match: {
            name: 'John'
        }
    }
};

search(query)
    .then(data => console.log(data))
    .catch(error => console.error(error));