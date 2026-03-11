const { handleChat, resetChat } = require('./src/AI_Brain/Gemini_API');
require('dotenv').config();

async function runBenchmark() {
    console.log('🚀 Starting AI Response Latency Test...');
    console.log('-------------------------------------------');

    const testQueries = [
        { name: "Simple Greeting", text: "สวัสดีครับ" },
        { name: "Knowledge Lookup (RAG)", text: "มีข้อมูลอะไรใน test_knowledge.txt บ้าง?" },
        { name: "Action Command", text: "เปิด YouTube ให้หน่อย" },
        { name: "System Command", text: "ขอดูข้อมูลระบบหน่อย" }
    ];

    const results = [];

    for (const query of testQueries) {
        console.log(`Testing: ${query.name} ("${query.text}")`);
        
        const start = Date.now();
        try {
            const response = await handleChat(query.text);
            const duration = Date.now() - start;
            
            results.push({
                name: query.name,
                latency: duration,
                action: response.action.type,
                success: true
            });
            console.log(`✅ Completed in ${duration}ms (Action: ${response.action.type})`);
        } catch (err) {
            const duration = Date.now() - start;
            results.push({
                name: query.name,
                latency: duration,
                success: false,
                error: err.message
            });
            console.log(`❌ Failed after ${duration}ms: ${err.message}`);
        }
        
        // Short delay between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n-------------------------------------------');
    console.log('📊 Benchmark Summary:');
    const totalLatency = results.reduce((sum, r) => sum + r.latency, 0);
    const avgLatency = (totalLatency / results.length).toFixed(2);
    
    results.forEach(r => {
        const status = r.success ? 'OK' : 'FAIL';
        console.log(`- ${r.name.padEnd(25)}: ${r.latency.toString().padStart(5)}ms [${status}]`);
    });
    
    console.log(`\nAverage Latency: ${avgLatency}ms`);
    
    if (avgLatency > 4000) {
        console.log('\n⚠️  Analysis: Response time is quite high (>4s).');
        console.log('Potential causes:');
        console.log('1. Large System Instruction (Gemini_API.js)');
        console.log('2. Slow Local RAG search (knowledge_base.js)');
        console.log('3. Network latency to Gemini API');
    } else {
        console.log('\n✨ Latency is within acceptable range (<4s).');
    }
}

// Run the benchmark
runBenchmark().catch(console.error);
