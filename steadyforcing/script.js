// Set different playback speeds based on video duration group
document.addEventListener('DOMContentLoaded', function() {
    const durationGroups = document.querySelectorAll('.duration-group');
    
    durationGroups.forEach((group, index) => {
        const videos = group.querySelectorAll('video');
        let speed = 1.0;
        
        // Determine speed based on the duration group
        const title = group.querySelector('.duration-title').textContent;
        
        if (title.includes('5 Seconds')) {
            speed = 1.0; // Keep original speed
        } else if (title.includes('60 Seconds')) {
            speed = 2.0; // 2x speed
        } else if (title.includes('120 Seconds')) {
            speed = 3.0; // 3x speed
        } else if (title.includes('240 Seconds')) {
            speed = 4.0; // 4x speed
        }
        
        videos.forEach(video => {
            video.playbackRate = speed;
        });
    });
    
    // Set custom demo videos to 2x speed
    const customVideos = document.querySelector('.section-container');
    if (customVideos) {
        customVideos.querySelectorAll('video').forEach(video => {
            video.playbackRate = 2.0;
        });
    }
    
    // Teaser and Film Strip JavaScript
    const teaserVideos = document.querySelectorAll('.teaser-section video');
    const filmStripVideos = document.querySelectorAll('.film-strip video');
    
    function loadVideoSource(video) {
        if (!video || video.dataset.loaded === 'true') return false;
        const sources = video.querySelectorAll('source[data-src]');
        if (!sources.length) {
            video.dataset.loaded = 'true';
            return false;
        }
        
        sources.forEach(source => {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
        });
        
        video.preload = video.autoplay || video.hasAttribute('data-always-play') ? 'auto' : 'metadata';
        video.load();
        video.dataset.loaded = 'true';
        return true;
    }
    
    function loadVideosInElement(element) {
        if (!element) return;
        element.querySelectorAll('video[data-lazy-video="true"]').forEach(loadVideoSource);
    }
    
    window.loadVideosInElement = loadVideosInElement;
    
    const lazyVideoObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                loadVideoSource(entry.target);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '600px 0px' })
        : null;
    
    document.querySelectorAll('video[data-lazy-video="true"]').forEach(video => {
        if (lazyVideoObserver) {
            lazyVideoObserver.observe(video);
        } else {
            loadVideoSource(video);
        }
    });
    
    // Duration badges (skip teaser videos)
    function formatVideoDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function attachDurationBadge(wrapper) {
        const video = wrapper.querySelector('video');
        if (!video || wrapper.querySelector('.video-duration-badge')) return;
        
        const badge = document.createElement('div');
        badge.className = 'video-duration-badge';
        badge.textContent = '0:00';
        wrapper.appendChild(badge);
        
        const updateDuration = () => {
            if (video.duration && isFinite(video.duration)) {
                badge.textContent = formatVideoDuration(video.duration);
            }
        };
        
        video.addEventListener('loadedmetadata', updateDuration);
        updateDuration();
    }
    
    document.querySelectorAll('.video-wrapper').forEach(wrapper => {
        if (!wrapper.closest('.teaser-section')) {
            attachDurationBadge(wrapper);
        }
    });
    
    const motivationsSection = Array.from(document.querySelectorAll('section')).find(section => {
        const h2 = section.querySelector('h2');
        return h2 && h2.textContent.includes('Motivations');
    });
    loadVideosInElement(motivationsSection);
    
    // Play all videos in the teaser section
    teaserVideos.forEach(video => {
        video.play().catch(error => {
            // Auto-play might be blocked by browser policy
            console.log("Teaser video auto-play blocked:", error);
        });
    });
    
    // Play all videos in the film strip
    filmStripVideos.forEach(video => {
        video.play().catch(error => {
            // Auto-play might be blocked by browser policy
            console.log("Video auto-play blocked:", error);
        });
    });
    
    function resetGridVideos(grid) {
        if (!grid) return;
        loadVideosInElement(grid);
        const videos = grid.querySelectorAll('video');
        videos.forEach(video => {
            try {
                if (video.loop) {
                    video.loop = false;
                }
                video.currentTime = 0;
            } catch (e) {
                console.warn('Unable to reset video time', e);
            }
        });
    }
    
    // Pause animation when tab is not visible to save resources
    document.addEventListener('visibilitychange', function() {
        const filmStrip = document.querySelector('.film-strip-inner');
        if (document.hidden) {
            if (filmStrip) {
                filmStrip.style.animationPlayState = 'paused';
            }
            teaserVideos.forEach(video => video.pause());
            filmStripVideos.forEach(video => video.pause());
        } else {
            if (filmStrip) {
                filmStrip.style.animationPlayState = 'running';
            }
            teaserVideos.forEach(video => video.play().catch(e => {}));
            filmStripVideos.forEach(video => video.play().catch(e => {}));
        }
    });
    
    // Show/hide native video controls on hover
    document.querySelectorAll('.video-wrapper').forEach(wrapper => {
        const video = wrapper.querySelector('video');
        if (!video) return;
        
        // Ensure controls attribute is present
        if (!video.hasAttribute('controls')) {
            video.setAttribute('controls', '');
        }
        
        // Hide controls initially
        video.style.setProperty('--controls-opacity', '0');
        
        wrapper.addEventListener('mouseenter', function() {
            video.style.setProperty('--controls-opacity', '1');
            // Force controls to show
            video.controls = true;
        });
        
        wrapper.addEventListener('mouseleave', function() {
            video.style.setProperty('--controls-opacity', '0');
            // Small delay before hiding to allow interaction
            setTimeout(() => {
                if (!wrapper.matches(':hover')) {
                    video.controls = false;
                    // Re-enable after a moment so they can appear on next hover
                    setTimeout(() => {
                        video.controls = true;
                    }, 100);
                }
            }, 200);
        });
    });
    
    // Qualitative Comparison carousel functionality (ONLY for Qualitative Comparison)
    const qualitativeSection = Array.from(document.querySelectorAll('section.comparison-section')).find(section => {
        const h2 = section.querySelector('h2');
        return h2 && h2.textContent.includes('Qualitative Comparison');
    });
    const qualitativeCarousel = qualitativeSection ? qualitativeSection.querySelector('.comparison-carousel') : null;
    if (qualitativeCarousel) {
        const container = qualitativeCarousel.querySelector('.carousel-container');
        const grids = qualitativeCarousel.querySelectorAll('.comparison-grid');
        const indicatorsContainer = qualitativeCarousel.querySelector('.carousel-indicators');
        const prevButton = qualitativeCarousel.querySelector('.carousel-button.prev');
        const nextButton = qualitativeCarousel.querySelector('.carousel-button.next');
        const durationTitle = document.getElementById('dynamic-duration-title');
        let qualitativeCurrentIndex = 0;
        const qualitativeAutoArmed = new Array(grids.length).fill(false);
        const qualitativeCompletionState = Array.from(grids, () => new Set());
        
        // Create indicators
        grids.forEach((grid, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => qualitativeShowGrid(index));
            indicatorsContainer.appendChild(indicator);
        });
        
        const indicators = indicatorsContainer.querySelectorAll('.indicator');
        
        function qualitativeShowGrid(index) {
            grids.forEach((grid, gridIndex) => {
                grid.classList.remove('active');
                qualitativeAutoArmed[gridIndex] = false;
                qualitativeCompletionState[gridIndex].clear();
            });
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            grids[index].classList.add('active');
            indicators[index].classList.add('active');
            qualitativeCurrentIndex = index;
            qualitativeAutoArmed[index] = true;
            qualitativeCompletionState[index].clear();
            resetGridVideos(grids[index]);
            
            // Update duration title
            if (durationTitle && grids[index].dataset.duration) {
                durationTitle.textContent = grids[index].dataset.duration;
            }
        }
        
        grids.forEach((grid, gridIndex) => {
            const videos = grid.querySelectorAll('video');
            videos.forEach((video, videoIndex) => {
                video.loop = false;
                video.addEventListener('ended', () => {
                    if (!grid.classList.contains('active')) return;
                    if (!qualitativeAutoArmed[gridIndex]) return;
                    const totalVideos = videos.length;
                    if (totalVideos === 0) return;
                    qualitativeCompletionState[gridIndex].add(videoIndex);
                    if (qualitativeCompletionState[gridIndex].size >= totalVideos) {
                        qualitativeAutoArmed[gridIndex] = false;
                        const nextIndex = (gridIndex + 1) % grids.length;
                        qualitativeShowGrid(nextIndex);
                    }
                });
            });
        });
        
        prevButton.addEventListener('click', () => {
            const newIndex = (qualitativeCurrentIndex - 1 + grids.length) % grids.length;
            qualitativeShowGrid(newIndex);
        });
        
        nextButton.addEventListener('click', () => {
            const newIndex = (qualitativeCurrentIndex + 1) % grids.length;
            qualitativeShowGrid(newIndex);
        });
        
        qualitativeShowGrid(qualitativeCurrentIndex);
    }
    
    // Action Control Comparison carousel functionality (ONLY for Action Control Comparison)
    const actionControlSection = Array.from(document.querySelectorAll('section.comparison-section')).find(section => {
        const h2 = section.querySelector('h2');
        return h2 && h2.textContent.includes('Action Control Comparison');
    });
    const actionControlCarousel = actionControlSection ? actionControlSection.querySelector('.comparison-carousel') : null;
    if (actionControlCarousel) {
        const container = actionControlCarousel.querySelector('.carousel-container');
        const grids = actionControlCarousel.querySelectorAll('.action-control-grid');
        const durationGroup = actionControlSection.querySelector('.duration-group');
        const indicatorsContainer = durationGroup ? durationGroup.querySelector('.carousel-indicators') : null;
        const prevButton = actionControlCarousel.querySelector('.carousel-button.prev');
        const nextButton = actionControlCarousel.querySelector('.carousel-button.next');
        const durationTitle = document.getElementById('action-control-duration-title');
        let actionControlCurrentIndex = 0;
        const actionControlAutoArmed = new Array(grids.length).fill(false);
        
        // Duration System for Comparison 1
        const durationSystem1 = document.getElementById('comparison1-duration-system');
        const progressFill1 = document.getElementById('comparison1-progress');
        const promptDisplay1 = document.getElementById('comparison1-prompt');
        
        const prompts1 = [
            { start: 0, end: 10, text: 'Typing intently' },
            { start: 10, end: 20, text: 'Rubbing arm' },
            { start: 20, end: 30, text: 'Resuming work' },
            { start: 30, end: 40, text: 'Gentle murmur' },
            { start: 40, end: 50, text: 'Chin scratch' },
            { start: 50, end: 60, text: 'Head pat' }
        ];
        
        // Duration System for Comparison 2
        const durationSystem2 = document.getElementById('comparison2-duration-system');
        const progressFill2 = document.getElementById('comparison2-progress');
        const promptDisplay2 = document.getElementById('comparison2-prompt');
        
        const prompts2 = [
            { start: 0, end: 10, text: 'Solo rehearsal' },
            { start: 10, end: 20, text: 'Tracing line' },
            { start: 20, end: 30, text: 'Pirouette' },
            { start: 30, end: 40, text: 'Leap and land' },
            { start: 40, end: 50, text: 'Serene stillness' },
            { start: 50, end: 60, text: 'Stagehand enters' }
        ];
        
        // Duration System for Comparison 3
        const durationSystem3 = document.getElementById('comparison3-duration-system');
        const progressFill3 = document.getElementById('comparison3-progress');
        const promptDisplay3 = document.getElementById('comparison3-prompt');
        
        const prompts3 = [
            { start: 0, end: 10, text: 'Ethereal setup' },
            { start: 10, end: 20, text: 'Raising right hand' },
            { start: 20, end: 30, text: 'Breeze stirs' },
            { start: 30, end: 40, text: 'Closing eyes' },
            { start: 40, end: 50, text: 'Standing still and left arm by her side' },
            { start: 50, end: 60, text: 'Bird lands' }
        ];
        
        let trackedVideo1 = null;
        let trackedVideo2 = null;
        let trackedVideo3 = null;
        let currentPromptIndex1 = -1;
        let currentPromptIndex2 = -1;
        let currentPromptIndex3 = -1;
        
        function updateDurationSystem1(time) {
            if (!progressFill1 || !promptDisplay1) return;
            
            // Update progress bar (0-60 seconds)
            const progress = Math.min((time / 60) * 100, 100);
            progressFill1.style.width = progress + '%';
            
            // Update prompt based on time segment
            const currentPrompt = prompts1.find(p => time >= p.start && time < p.end) || prompts1[prompts1.length - 1];
            if (currentPrompt) {
                const promptIndex = prompts1.indexOf(currentPrompt);
                // Only update if prompt changed
                if (promptIndex !== currentPromptIndex1) {
                    currentPromptIndex1 = promptIndex;
                    // Add fade effect
                    promptDisplay1.style.opacity = '0';
                    promptDisplay1.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        promptDisplay1.textContent = currentPrompt.text;
                        promptDisplay1.style.opacity = '1';
                        promptDisplay1.style.transform = 'translateY(0)';
                    }, 150);
                }
            }
        }
        
        function updateDurationSystem2(time) {
            if (!progressFill2 || !promptDisplay2) return;
            
            // Update progress bar (0-60 seconds)
            const progress = Math.min((time / 60) * 100, 100);
            progressFill2.style.width = progress + '%';
            
            // Update prompt based on time segment
            const currentPrompt = prompts2.find(p => time >= p.start && time < p.end) || prompts2[prompts2.length - 1];
            if (currentPrompt) {
                const promptIndex = prompts2.indexOf(currentPrompt);
                // Only update if prompt changed
                if (promptIndex !== currentPromptIndex2) {
                    currentPromptIndex2 = promptIndex;
                    // Add fade effect
                    promptDisplay2.style.opacity = '0';
                    promptDisplay2.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        promptDisplay2.textContent = currentPrompt.text;
                        promptDisplay2.style.opacity = '1';
                        promptDisplay2.style.transform = 'translateY(0)';
                    }, 150);
                }
            }
        }
        
        function updateDurationSystem3(time) {
            if (!progressFill3 || !promptDisplay3) return;
            
            // Update progress bar (0-60 seconds)
            const progress = Math.min((time / 60) * 100, 100);
            progressFill3.style.width = progress + '%';
            
            // Update prompt based on time segment
            const currentPrompt = prompts3.find(p => time >= p.start && time < p.end) || prompts3[prompts3.length - 1];
            if (currentPrompt) {
                const promptIndex = prompts3.indexOf(currentPrompt);
                // Only update if prompt changed
                if (promptIndex !== currentPromptIndex3) {
                    currentPromptIndex3 = promptIndex;
                    // Add fade effect
                    promptDisplay3.style.opacity = '0';
                    promptDisplay3.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        promptDisplay3.textContent = currentPrompt.text;
                        promptDisplay3.style.opacity = '1';
                        promptDisplay3.style.transform = 'translateY(0)';
                    }, 150);
                }
            }
        }
        
        function startDurationTracking1() {
            // Stop any existing tracking
            if (trackedVideo1 && trackedVideo1._durationHandler) {
                trackedVideo1.removeEventListener('timeupdate', trackedVideo1._durationHandler);
            }
            
            // Find Comparison 1 grid (now has ballet videos, should use system2)
            const comparison1Grid = actionControlSection.querySelector('.action-control-grid[data-comparison="Comparison 1"]');
            if (!comparison1Grid) return;
            
            // Get first video in Comparison 1
            const videos = comparison1Grid.querySelectorAll('video');
            if (videos.length === 0) return;
            
            trackedVideo1 = videos[0];
            
            // Add event listener - use system2 for Comparison 1
            const handler = () => updateDurationSystem2(trackedVideo1.currentTime);
            trackedVideo1.addEventListener('timeupdate', handler);
            trackedVideo1._durationHandler = handler;
            
            // Initial update
            updateDurationSystem2(trackedVideo1.currentTime);
        }
        
        function startDurationTracking2() {
            // Stop any existing tracking
            if (trackedVideo2 && trackedVideo2._durationHandler) {
                trackedVideo2.removeEventListener('timeupdate', trackedVideo2._durationHandler);
            }
            
            // Find Comparison 2 grid (now has cat videos, should use system1)
            const comparison2Grid = actionControlSection.querySelector('.action-control-grid[data-comparison="Comparison 2"]');
            if (!comparison2Grid) return;
            
            // Get first video in Comparison 2
            const videos = comparison2Grid.querySelectorAll('video');
            if (videos.length === 0) return;
            
            trackedVideo2 = videos[0];
            
            // Add event listener - use system1 for Comparison 2
            const handler = () => updateDurationSystem1(trackedVideo2.currentTime);
            trackedVideo2.addEventListener('timeupdate', handler);
            trackedVideo2._durationHandler = handler;
            
            // Initial update
            updateDurationSystem1(trackedVideo2.currentTime);
        }
        
        function startDurationTracking3() {
            // Stop any existing tracking
            if (trackedVideo3 && trackedVideo3._durationHandler) {
                trackedVideo3.removeEventListener('timeupdate', trackedVideo3._durationHandler);
            }
            
            // Find Comparison 3 grid
            const comparison3Grid = actionControlSection.querySelector('.action-control-grid[data-comparison="Comparison 3"]');
            if (!comparison3Grid) return;
            
            // Get first video in Comparison 3
            const videos = comparison3Grid.querySelectorAll('video');
            if (videos.length === 0) return;
            
            trackedVideo3 = videos[0];
            
            // Add event listener - use system3 for Comparison 3
            const handler = () => updateDurationSystem3(trackedVideo3.currentTime);
            trackedVideo3.addEventListener('timeupdate', handler);
            trackedVideo3._durationHandler = handler;
            
            // Initial update
            updateDurationSystem3(trackedVideo3.currentTime);
        }
        
        function toggleDurationSystem(comparisonIndex) {
            // Hide all systems first
            if (durationSystem1) durationSystem1.style.display = 'none';
            if (durationSystem2) durationSystem2.style.display = 'none';
            if (durationSystem3) durationSystem3.style.display = 'none';
            
            // Stop all tracking
            if (trackedVideo1 && trackedVideo1._durationHandler) {
                trackedVideo1.removeEventListener('timeupdate', trackedVideo1._durationHandler);
                trackedVideo1._durationHandler = null;
            }
            if (trackedVideo2 && trackedVideo2._durationHandler) {
                trackedVideo2.removeEventListener('timeupdate', trackedVideo2._durationHandler);
                trackedVideo2._durationHandler = null;
            }
            if (trackedVideo3 && trackedVideo3._durationHandler) {
                trackedVideo3.removeEventListener('timeupdate', trackedVideo3._durationHandler);
                trackedVideo3._durationHandler = null;
            }
            
            // Show and start tracking for the active comparison
            // Index 0 (Comparison 1 - ballet) shows system2 (Solo rehearsal prompts)
            // Index 1 (Comparison 2 - cat) shows system1 (Typing intently prompts)
            // Index 2 (Comparison 3 - model) shows system3 (Ethereal setup prompts)
            if (comparisonIndex === 0) {
                if (durationSystem2) {
                    durationSystem2.style.display = 'block';
                    setTimeout(() => startDurationTracking1(), 200);
                }
            } else if (comparisonIndex === 1) {
                if (durationSystem1) {
                    durationSystem1.style.display = 'block';
                    setTimeout(() => startDurationTracking2(), 200);
                }
            } else if (comparisonIndex === 2) {
                if (durationSystem3) {
                    durationSystem3.style.display = 'block';
                    setTimeout(() => startDurationTracking3(), 200);
                }
            }
        }
        
        // Create indicators
        const indicators = [];
        if (indicatorsContainer) {
            grids.forEach((grid, index) => {
                const indicator = document.createElement('button');
                indicator.className = 'indicator';
                if (index === 0) indicator.classList.add('active');
                indicator.addEventListener('click', () => actionControlShowGrid(index));
                indicatorsContainer.appendChild(indicator);
                indicators.push(indicator);
            });
        }
        
        function actionControlShowGrid(index) {
            grids.forEach((grid, gridIndex) => {
                grid.classList.remove('active');
                actionControlAutoArmed[gridIndex] = false;
            });
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            grids[index].classList.add('active');
            indicators[index].classList.add('active');
            actionControlCurrentIndex = index;
            actionControlAutoArmed[index] = true;
            resetGridVideos(grids[index]);
            
            // Update duration title
            if (durationTitle && grids[index].dataset.comparison) {
                durationTitle.textContent = grids[index].dataset.comparison;
            }
            
            // Toggle duration system for Comparison 1 or 2
            toggleDurationSystem(index);
        }
        
        grids.forEach((grid, index) => {
            const referenceVideo = grid.querySelector('video');
            if (!referenceVideo) return;
            referenceVideo.addEventListener('ended', () => {
                if (!grid.classList.contains('active')) return;
                if (!actionControlAutoArmed[index]) return;
                actionControlAutoArmed[index] = false;
                const nextIndex = (index + 1) % grids.length;
                actionControlShowGrid(nextIndex);
            });
        });
        
        prevButton.addEventListener('click', () => {
            const newIndex = (actionControlCurrentIndex - 1 + grids.length) % grids.length;
            actionControlShowGrid(newIndex);
        });
        
        nextButton.addEventListener('click', () => {
            const newIndex = (actionControlCurrentIndex + 1) % grids.length;
            actionControlShowGrid(newIndex);
        });
        
        actionControlShowGrid(actionControlCurrentIndex);
    }
});

// Video control functionality for qualitative results, ablation sections, and action control comparison
document.addEventListener('DOMContentLoaded', function() {
    // Get all control buttons (restart, play, stop)
    const controlButtons = document.querySelectorAll('.control-btn');
    
    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const sectionType = this.getAttribute('data-section');
            
            // Handle Motivations section
            if (sectionType === 'motivations') {
                const motivationsSection = Array.from(document.querySelectorAll('section')).find(section => {
                    const h2 = section.querySelector('h2');
                    return h2 && h2.textContent.includes('Motivations');
                });
                
                if (motivationsSection) {
                    if (window.loadVideosInElement) {
                        window.loadVideosInElement(motivationsSection);
                    }
                    // Pause other sections on play/restart (motivations is exempt from being paused)
                    if (action === 'restart' || action === 'play') {
                        if (window.pauseOtherSections) {
                            window.pauseOtherSections(motivationsSection);
                        }
                    }
                    
                    // Get all videos in the section
                    const videos = motivationsSection.querySelectorAll('video');
                    
                    videos.forEach(video => {
                        if (action === 'restart') {
                            video.currentTime = 0;
                            video.play();
                        } else if (action === 'play') {
                            video.play();
                        } else if (action === 'stop') {
                            video.pause();
                        }
                    });
                }
            }
            // Handle Action Control Comparison section specially
            else if (sectionType === 'action-control-comparison') {
                const actionControlSection = Array.from(document.querySelectorAll('section.comparison-section')).find(section => {
                    const h2 = section.querySelector('h2');
                    return h2 && h2.textContent.includes('Action Control Comparison');
                });
                
                if (actionControlSection) {
                    if (window.loadVideosInElement) {
                        window.loadVideosInElement(actionControlSection);
                    }
                    // Get all videos in the section
                    const videos = actionControlSection.querySelectorAll('video');
                    
                    // Get duration system references
                    const durationSystem1 = document.getElementById('comparison1-duration-system');
                    const durationSystem2 = document.getElementById('comparison2-duration-system');
                    const durationSystem3 = document.getElementById('comparison3-duration-system');
                    const progressFill1 = document.getElementById('comparison1-progress');
                    const progressFill2 = document.getElementById('comparison2-progress');
                    const progressFill3 = document.getElementById('comparison3-progress');
                    const promptDisplay1 = document.getElementById('comparison1-prompt');
                    const promptDisplay2 = document.getElementById('comparison2-prompt');
                    const promptDisplay3 = document.getElementById('comparison3-prompt');
                    
                    // Prompt arrays
                    const prompts1 = [
                        { start: 0, end: 10, text: 'Typing intently' },
                        { start: 10, end: 20, text: 'Rubbing arm' },
                        { start: 20, end: 30, text: 'Resuming work' },
                        { start: 30, end: 40, text: 'Gentle murmur' },
                        { start: 40, end: 50, text: 'Chin scratch' },
                        { start: 50, end: 60, text: 'Head pat' }
                    ];
                    const prompts2 = [
                        { start: 0, end: 10, text: 'Solo rehearsal' },
                        { start: 10, end: 20, text: 'Tracing line' },
                        { start: 20, end: 30, text: 'Pirouette' },
                        { start: 30, end: 40, text: 'Leap and land' },
                        { start: 40, end: 50, text: 'Serene stillness' },
                        { start: 50, end: 60, text: 'Stagehand enters' }
                    ];
                    const prompts3 = [
                        { start: 0, end: 10, text: 'Ethereal setup' },
                        { start: 10, end: 20, text: 'Raising right hand' },
                        { start: 20, end: 30, text: 'Breeze stirs' },
                        { start: 30, end: 40, text: 'Closing eyes' },
                        { start: 40, end: 50, text: 'Standing still and left arm by her side' },
                        { start: 50, end: 60, text: 'Bird lands' }
                    ];
                    
                    // Track current prompt indices for each system
                    let currentPromptIndex1 = -1;
                    let currentPromptIndex2 = -1;
                    let currentPromptIndex3 = -1;
                    
                    // Helper function to update duration system with prompts
                    function updateSystemWithPrompt(time, systemNum, forceUpdate = false) {
                        let progressFill, promptDisplay, prompts, currentPromptIndex;
                        if (systemNum === 1) {
                            progressFill = progressFill1;
                            promptDisplay = promptDisplay1;
                            prompts = prompts1;
                            currentPromptIndex = currentPromptIndex1;
                        } else if (systemNum === 2) {
                            progressFill = progressFill2;
                            promptDisplay = promptDisplay2;
                            prompts = prompts2;
                            currentPromptIndex = currentPromptIndex2;
                        } else if (systemNum === 3) {
                            progressFill = progressFill3;
                            promptDisplay = promptDisplay3;
                            prompts = prompts3;
                            currentPromptIndex = currentPromptIndex3;
                        }
                        
                        if (!progressFill || !promptDisplay) return;
                        
                        // Update progress bar
                        const progress = Math.min((time / 60) * 100, 100);
                        progressFill.style.width = progress + '%';
                        
                        // Update prompt based on time segment
                        const currentPrompt = prompts.find(p => time >= p.start && time < p.end) || prompts[prompts.length - 1];
                        if (currentPrompt) {
                            const promptIndex = prompts.indexOf(currentPrompt);
                            // Only update if prompt changed or forced
                            if (forceUpdate || promptIndex !== currentPromptIndex) {
                                // Update the tracked index
                                if (systemNum === 1) {
                                    currentPromptIndex1 = promptIndex;
                                } else if (systemNum === 2) {
                                    currentPromptIndex2 = promptIndex;
                                } else if (systemNum === 3) {
                                    currentPromptIndex3 = promptIndex;
                                }
                                
                                // Update prompt with fade effect
                                promptDisplay.style.opacity = '0';
                                promptDisplay.style.transform = 'translateY(-10px)';
                                setTimeout(() => {
                                    promptDisplay.textContent = currentPrompt.text;
                                    promptDisplay.style.opacity = '1';
                                    promptDisplay.style.transform = 'translateY(0)';
                                }, 150);
                            }
                        }
                    }
                    
                    // Get tracked videos
                    const comparison1Grid = actionControlSection.querySelector('.action-control-grid[data-comparison="Comparison 1"]');
                    const comparison2Grid = actionControlSection.querySelector('.action-control-grid[data-comparison="Comparison 2"]');
                    const comparison3Grid = actionControlSection.querySelector('.action-control-grid[data-comparison="Comparison 3"]');
                    const trackedVideo1 = comparison1Grid ? comparison1Grid.querySelector('video') : null;
                    const trackedVideo2 = comparison2Grid ? comparison2Grid.querySelector('video') : null;
                    const trackedVideo3 = comparison3Grid ? comparison3Grid.querySelector('video') : null;
                    
                    if (action === 'restart') {
                        // Pause other sections
                        if (window.pauseOtherSections) {
                            window.pauseOtherSections(actionControlSection);
                        }
                        
                        // Reset all videos
                        videos.forEach(video => {
                            video.currentTime = 0;
                            video.play();
                        });
                        
                        // Reset prompt indices
                        currentPromptIndex1 = -1;
                        currentPromptIndex2 = -1;
                        currentPromptIndex3 = -1;
                        
                        // Reset all duration bars and prompts to 0 (force update)
                        updateSystemWithPrompt(0, 1, true);
                        updateSystemWithPrompt(0, 2, true);
                        updateSystemWithPrompt(0, 3, true);
                        
                        // Restart duration tracking
                        setTimeout(() => {
                            const activeGrid = actionControlSection.querySelector('.action-control-grid.active');
                            if (activeGrid) {
                                const comparison = activeGrid.getAttribute('data-comparison');
                                if (comparison === 'Comparison 1') {
                                    // Use system2 for Comparison 1
                                    if (trackedVideo1 && durationSystem2 && durationSystem2.style.display !== 'none') {
                                        const handler = () => {
                                            updateSystemWithPrompt(trackedVideo1.currentTime, 2);
                                        };
                                        if (trackedVideo1._durationHandler) {
                                            trackedVideo1.removeEventListener('timeupdate', trackedVideo1._durationHandler);
                                        }
                                        trackedVideo1.addEventListener('timeupdate', handler);
                                        trackedVideo1._durationHandler = handler;
                                    }
                                } else if (comparison === 'Comparison 2') {
                                    // Use system1 for Comparison 2
                                    if (trackedVideo2 && durationSystem1 && durationSystem1.style.display !== 'none') {
                                        const handler = () => {
                                            updateSystemWithPrompt(trackedVideo2.currentTime, 1);
                                        };
                                        if (trackedVideo2._durationHandler) {
                                            trackedVideo2.removeEventListener('timeupdate', trackedVideo2._durationHandler);
                                        }
                                        trackedVideo2.addEventListener('timeupdate', handler);
                                        trackedVideo2._durationHandler = handler;
                                    }
                                } else if (comparison === 'Comparison 3') {
                                    // Use system3 for Comparison 3
                                    if (trackedVideo3 && durationSystem3 && durationSystem3.style.display !== 'none') {
                                        const handler = () => {
                                            updateSystemWithPrompt(trackedVideo3.currentTime, 3);
                                        };
                                        if (trackedVideo3._durationHandler) {
                                            trackedVideo3.removeEventListener('timeupdate', trackedVideo3._durationHandler);
                                        }
                                        trackedVideo3.addEventListener('timeupdate', handler);
                                        trackedVideo3._durationHandler = handler;
                                    }
                                }
                            }
                        }, 100);
                        
                    } else if (action === 'play') {
                        // Pause other sections
                        if (window.pauseOtherSections) {
                            window.pauseOtherSections(actionControlSection);
                        }
                        
                        // Play all videos
                        videos.forEach(video => {
                            video.play();
                        });
                        
                        // Restart duration tracking with prompt updates
                        setTimeout(() => {
                            const activeGrid = actionControlSection.querySelector('.action-control-grid.active');
                            if (activeGrid) {
                                const comparison = activeGrid.getAttribute('data-comparison');
                                if (comparison === 'Comparison 1' && trackedVideo1 && durationSystem2 && durationSystem2.style.display !== 'none') {
                                    const handler = () => {
                                        updateSystemWithPrompt(trackedVideo1.currentTime, 2);
                                    };
                                    if (trackedVideo1._durationHandler) {
                                        trackedVideo1.removeEventListener('timeupdate', trackedVideo1._durationHandler);
                                    }
                                    trackedVideo1.addEventListener('timeupdate', handler);
                                    trackedVideo1._durationHandler = handler;
                                    // Initial update
                                    updateSystemWithPrompt(trackedVideo1.currentTime, 2);
                                } else if (comparison === 'Comparison 2' && trackedVideo2 && durationSystem1 && durationSystem1.style.display !== 'none') {
                                    const handler = () => {
                                        updateSystemWithPrompt(trackedVideo2.currentTime, 1);
                                    };
                                    if (trackedVideo2._durationHandler) {
                                        trackedVideo2.removeEventListener('timeupdate', trackedVideo2._durationHandler);
                                    }
                                    trackedVideo2.addEventListener('timeupdate', handler);
                                    trackedVideo2._durationHandler = handler;
                                    // Initial update
                                    updateSystemWithPrompt(trackedVideo2.currentTime, 1);
                                } else if (comparison === 'Comparison 3' && trackedVideo3 && durationSystem3 && durationSystem3.style.display !== 'none') {
                                    const handler = () => {
                                        updateSystemWithPrompt(trackedVideo3.currentTime, 3);
                                    };
                                    if (trackedVideo3._durationHandler) {
                                        trackedVideo3.removeEventListener('timeupdate', trackedVideo3._durationHandler);
                                    }
                                    trackedVideo3.addEventListener('timeupdate', handler);
                                    trackedVideo3._durationHandler = handler;
                                    // Initial update
                                    updateSystemWithPrompt(trackedVideo3.currentTime, 3);
                                }
                            }
                        }, 100);
                        
                    } else if (action === 'stop') {
                        // Stop all videos
                        videos.forEach(video => {
                            video.pause();
                        });
                        
                        // Stop duration tracking by removing event listeners
                        if (trackedVideo1 && trackedVideo1._durationHandler) {
                            trackedVideo1.removeEventListener('timeupdate', trackedVideo1._durationHandler);
                            trackedVideo1._durationHandler = null;
                        }
                        if (trackedVideo2 && trackedVideo2._durationHandler) {
                            trackedVideo2.removeEventListener('timeupdate', trackedVideo2._durationHandler);
                            trackedVideo2._durationHandler = null;
                        }
                        if (trackedVideo3 && trackedVideo3._durationHandler) {
                            trackedVideo3.removeEventListener('timeupdate', trackedVideo3._durationHandler);
                            trackedVideo3._durationHandler = null;
                        }
                    }
                }
            });
            
            // Get all speed control buttons
            const speedButtons = document.querySelectorAll('.speed-btn');
            
            speedButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const speed = parseFloat(this.getAttribute('data-speed'));
                    const sectionType = this.getAttribute('data-section');
                    
                    // Handle Motivations section
                    if (sectionType === 'motivations') {
                        const motivationsSection = Array.from(document.querySelectorAll('section')).find(section => {
                            const h2 = section.querySelector('h2');
                            return h2 && h2.textContent.includes('Motivations');
                        });
                        
                        if (motivationsSection) {
                            // Remove active class from all speed buttons in this section
                            motivationsSection.querySelectorAll('.speed-btn').forEach(btn => {
                                btn.classList.remove('active');
                            });
                            // Add active class to clicked button
                            this.classList.add('active');
                            
                            // Get all videos in the section
                            const videos = motivationsSection.querySelectorAll('video');
                            videos.forEach(video => {
                                video.playbackRate = speed;
                            });
                        }
                    }
                    // Handle Action Control Comparison section
                    else if (sectionType === 'action-control-comparison') {
                        const actionControlSection = Array.from(document.querySelectorAll('section.comparison-section')).find(section => {
                            const h2 = section.querySelector('h2');
                            return h2 && h2.textContent.includes('Action Control Comparison');
                        });
                        
                        if (actionControlSection) {
                            // Remove active class from all speed buttons in this section
                            actionControlSection.querySelectorAll('.speed-btn').forEach(btn => {
                                btn.classList.remove('active');
                            });
                            // Add active class to clicked button
                            this.classList.add('active');
                            
                            // Get all videos in the section
                            const videos = actionControlSection.querySelectorAll('video');
                            videos.forEach(video => {
                                video.playbackRate = speed;
                            });
                        }
                    }
                    // Handle Qualitative Comparison section
                    else if (sectionType === 'qualitative-comparison') {
                        const qualitativeSection = Array.from(document.querySelectorAll('section.comparison-section')).find(section => {
                            const h2 = section.querySelector('h2');
                            return h2 && h2.textContent.includes('Qualitative Comparison');
                        });
                        
                        if (qualitativeSection) {
                            qualitativeSection.querySelectorAll('.speed-btn').forEach(btn => {
                                btn.classList.remove('active');
                            });
                            this.classList.add('active');
                            
                            const videos = qualitativeSection.querySelectorAll('video');
                            videos.forEach(video => {
                                video.playbackRate = speed;
                            });
                        }
                    } else {
                        // Handle regular subsections (qualitative-subsection, subsection, or ablation-subsection)
                        const subsection = this.closest('.qualitative-subsection, .subsection, .ablation-subsection');
                        if (subsection) {
                            // Remove active class from all buttons in this subsection
                            subsection.querySelectorAll('.speed-btn').forEach(btn => {
                                btn.classList.remove('active');
                            });
                            // Add active class to clicked button
                            this.classList.add('active');
                            
                            // Get all videos in this subsection
                            const videos = subsection.querySelectorAll('video');
                            videos.forEach(video => {
                                video.playbackRate = speed;
                            });
                        }
                    }
                });
            });
            
            // Set default 2x speed on page load
            document.querySelectorAll('.qualitative-subsection video, .subsection video, .ablation-subsection video').forEach(video => {
                video.playbackRate = 2;
            });
            
            // Set default 2x speed for Action Control Comparison section
            const actionControlSection = Array.from(document.querySelectorAll('section.comparison-section')).find(section => {
                const h2 = section.querySelector('h2');
                return h2 && h2.textContent.includes('Action Control Comparison');
            });
            if (actionControlSection) {
                actionControlSection.querySelectorAll('video').forEach(video => {
                    video.playbackRate = 2;
                });
            }
            
            // Set default 2x speed for Qualitative Comparison section
            const qualitativeComparisonSection = Array.from(document.querySelectorAll('section.comparison-section')).find(section => {
                const h2 = section.querySelector('h2');
                return h2 && h2.textContent.includes('Qualitative Comparison');
            });
            if (qualitativeComparisonSection) {
                qualitativeComparisonSection.querySelectorAll('video').forEach(video => {
                    video.playbackRate = 2;
                });
            }
            
            // Set default 2x speed for Motivations section
            const motivationsSection = Array.from(document.querySelectorAll('section')).find(section => {
                const h2 = section.querySelector('h2');
                return h2 && h2.textContent.includes('Motivations');
            });
            if (motivationsSection) {
                motivationsSection.querySelectorAll('video').forEach(video => {
                    video.playbackRate = 2;
                });
            }
            
            // Activate 2x buttons by default
            document.querySelectorAll('.speed-btn[data-speed="2"]').forEach(btn => {
                btn.classList.add('active');
            });
            
            // Pause all videos except teaser and motivations on page load for efficiency
            const teaserSection = document.querySelector('.teaser-section');
            const motivationsSectionEl = Array.from(document.querySelectorAll('section')).find(section => {
                const h2 = section.querySelector('h2');
                return h2 && h2.textContent.includes('Motivations');
            });
            
            document.querySelectorAll('video').forEach(video => {
                const isInTeaser = teaserSection && teaserSection.contains(video);
                const isInMotivations = motivationsSectionEl && motivationsSectionEl.contains(video);
                
                if (!isInTeaser && !isInMotivations) {
                    video.pause();
                }
            });
            
            // Function to pause all videos except teaser and motivations
            function pauseOtherSections(exceptElement) {
                const teaserSection = document.querySelector('.teaser-section');
                const motivationsSectionEl = Array.from(document.querySelectorAll('section')).find(section => {
                    const h2 = section.querySelector('h2');
                    return h2 && h2.textContent.includes('Motivations');
                });
                
                document.querySelectorAll('.qualitative-subsection, .subsection, .ablation-subsection, .comparison-section').forEach(section => {
                    // Skip teaser and motivations
                    if (teaserSection && teaserSection.contains(section)) return;
                    if (motivationsSectionEl && motivationsSectionEl.contains(section)) return;
                    // Skip the currently active section/subsection
                    if (exceptElement && (section === exceptElement || section.contains(exceptElement) || exceptElement.contains(section))) return;
                    
                    section.querySelectorAll('video').forEach(video => {
                        // Don't pause videos marked as always-play
                        if (video.hasAttribute('data-always-play')) return;
                        video.pause();
                    });
                });
            }
            
            // Store the pauseOtherSections function globally for use in control handlers
            window.pauseOtherSections = pauseOtherSections;
        });

        function copyBibtex() {
            const bibtexContent = document.getElementById('bibtex-content').textContent;
            navigator.clipboard.writeText(bibtexContent).then(() => {
                const button = document.querySelector('.copy-button');
                const originalHTML = button.innerHTML;
                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                button.style.color = '#27ae60';
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
        
        // More Research dropdown toggle
        function toggleResearchDropdown() {
            const dropdown = document.querySelector('.more-research-dropdown');
            dropdown.classList.toggle('open');
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.querySelector('.more-research-dropdown');
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('open');
            }
        });
