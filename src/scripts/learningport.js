(function () {
  'use strict';

  function initLearningsportSite() {
    var root = document.getElementById('lp-site-root');
    if (!root) return;

    /* ========================================================================
       0. HEADER SCROLL EFFECT (> 50px)
       ======================================================================== */
    var headerEl = root.querySelector('.lp-header');
    if (headerEl) {
      var updateHeaderScroll = function () {
        if (window.scrollY > 50) {
          headerEl.classList.add('is-scrolled');
        } else {
          headerEl.classList.remove('is-scrolled');
        }
      };
      updateHeaderScroll();
      window.addEventListener('scroll', updateHeaderScroll, { passive: true });
    }

    /* ========================================================================
       1. NAVIGATION DROPDOWNS & MOBILE MENU
       ======================================================================== */
    var dropdownItems = root.querySelectorAll('.lp-nav-item[data-dropdown]');

    function closeAllDropdowns(exceptItem) {
      dropdownItems.forEach(function (item) {
        if (item !== exceptItem) {
          item.classList.remove('is-open');
          var trigger = item.querySelector('.lp-nav-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    dropdownItems.forEach(function (item) {
      var trigger = item.querySelector('.lp-nav-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !item.classList.contains('is-open');
        closeAllDropdowns(item);
        item.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      item.querySelectorAll('.lp-dropdown-link').forEach(function (link) {
        link.addEventListener('click', function () {
          closeAllDropdowns(null);
        });
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.lp-nav-item[data-dropdown]')) {
        closeAllDropdowns(null);
      }
    });

    /* Mobile Drawer */
    var mobileToggle = root.querySelector('#lp-mobile-toggle');
    var mobileDrawer = root.querySelector('#lp-mobile-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', function () {
        var isOpen = mobileDrawer.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      mobileDrawer.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileDrawer.classList.remove('is-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    root.querySelectorAll('.lp-mobile-acc-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        var subMenu = root.querySelector('#' + targetId);
        if (!subMenu) return;
        var isOpen = subMenu.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });

    /* ========================================================================
       2. CURRICULUM ACCORDION (13 MODULES)
       ======================================================================== */
    var curriculumItems = root.querySelectorAll('.lp-curriculum-acc .lp-acc-item');

    curriculumItems.forEach(function (item) {
      var trigger = item.querySelector('.lp-acc-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function () {
        var isAlreadyOpen = item.classList.contains('is-open');

        curriculumItems.forEach(function (other) {
          other.classList.remove('is-open');
          var otherBtn = other.querySelector('.lp-acc-trigger');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isAlreadyOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* ========================================================================
       3. FAQ ACCORDION (10 ITEMS)
       ======================================================================== */
    var faqItems = root.querySelectorAll('.lp-faq-item');

    faqItems.forEach(function (item) {
      var trigger = item.querySelector('.lp-faq-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function () {
        var isAlreadyOpen = item.classList.contains('is-open');
        faqItems.forEach(function (other) {
          other.classList.remove('is-open');
          var otherBtn = other.querySelector('.lp-faq-trigger');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isAlreadyOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* ========================================================================
       4. MODALS (CALLBACK, SYLLABUS, PROJECT DETAIL, PROGRAM DETAIL, INFO)
       ======================================================================== */
    var callbackModal = root.querySelector('#lp-callback-modal');
    var syllabusModal = root.querySelector('#lp-syllabus-modal');
    var infoModal = root.querySelector('#lp-info-modal');
    var infoTitleEl = root.querySelector('#lp-info-modal-title');
    var infoBodyEl = root.querySelector('#lp-info-modal-body');

    function closeAllModals() {
      [callbackModal, syllabusModal, infoModal].forEach(function (modal) {
        if (modal) {
          modal.classList.remove('is-open');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    }

    function openModal(modal) {
      closeAllModals();
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      var firstInput = modal.querySelector('input, select, button');
      if (firstInput) firstInput.focus();
    }

    root.querySelectorAll('[data-open-callback]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var feedback = root.querySelector('#lp-cb-feedback');
        if (feedback) {
          feedback.className = 'lp-form-feedback';
          feedback.textContent = '';
        }
        openModal(callbackModal);
      });
    });

    root.querySelectorAll('[data-open-syllabus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var courseName = btn.getAttribute('data-course') || 'VMware Certification Master Program';
        var courseInput = root.querySelector('#lp-syl-course');
        var modalHeading = root.querySelector('#lp-syl-modal-title');
        var feedback = root.querySelector('#lp-syl-feedback');

        if (courseInput) courseInput.value = courseName;
        if (modalHeading) modalHeading.textContent = 'Download Syllabus — ' + courseName;
        if (feedback) {
          feedback.className = 'lp-form-feedback';
          feedback.textContent = '';
        }
        openModal(syllabusModal);
      });
    });

    /* Project Portfolio "Know More" Details */
    var projectDetails = {
      shopease: {
        title: 'Scalable Continuous Deployment for ShopEase',
        summary: 'ShopEase is an e-commerce platform preparing for a high-volume shopping season. To ensure a seamless user experience, the platform must handle fluctuating traffic spikes with zero downtime.',
        deliverables: [
          'Provision multi-node VMware & Kubernetes clusters for rolling zero-downtime deployments.',
          'Configure automated CI/CD pipelines with build verification, container scanning, and canary rollouts.',
          'Implement auto-scaling load balancers and centralized logging dashboards for real-time health monitoring.'
        ]
      },
      gcpweb: {
        title: 'Scalable Web Application Deployment on Cloud',
        summary: 'Deploy a scalable web application on Google Cloud Platform (GCP) using Compute Engine and Cloud Load Balancing while ensuring strict network isolation and security.',
        deliverables: [
          'Architect isolated VPC subnets, firewall rules, and Cloud NAT gateways.',
          'Configure managed instance groups with health checks and HTTP(S) load balancing.',
          'Automate infrastructure provisioning and backup snapshots across availability zones.'
        ]
      },
      iotanalytics: {
        title: 'Cloud-Based IoT Data Analytics Platform',
        summary: 'Deploy an end-to-end IoT data analytics platform on cloud infrastructure using virtual machines for compute, object storage for telemetry ingestion, and a managed database.',
        deliverables: [
          'Set up high-throughput ingestion services across virtualized worker nodes.',
          'Route raw telemetry streams into durable object storage buckets with lifecycle policies.',
          'Build scheduled aggregation jobs writing processed insights to a managed database.'
        ]
      }
    };

    root.querySelectorAll('[data-project-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-project-id');
        var detail = projectDetails[key];
        if (!detail || !infoTitleEl || !infoBodyEl) return;

        infoTitleEl.textContent = detail.title;
        var listItems = detail.deliverables
          .map(function (item) {
            return '<li>' + item + '</li>';
          })
          .join('');

        infoBodyEl.innerHTML =
          '<p>' + detail.summary + '</p>' +
          '<p><strong>Key Implementation Deliverables:</strong></p>' +
          '<ul class="lp-modal-list">' + listItems + '</ul>' +
          '<button type="button" class="lp-btn lp-btn-primary" style="width:100%" data-modal-to-callback>Request Project Walkthrough</button>';

        var walkBtn = infoBodyEl.querySelector('[data-modal-to-callback]');
        if (walkBtn) {
          walkBtn.addEventListener('click', function () {
            openModal(callbackModal);
          });
        }

        openModal(infoModal);
      });
    });

    /* Trending Courses "View Program" Details */
    var programDetails = {
      aws: {
        title: 'AWS Certification Training',
        duration: '2 Months · Online / Classroom',
        summary: 'Master AWS core services including EC2, VPC, S3, IAM, RDS, CloudFormation, and serverless architectures with real-world cloud labs.'
      },
      vmware: {
        title: 'VMware Certification Training',
        duration: '2 Months · Online / Classroom',
        summary: 'Hands-on training covering VMware vSphere, ESXi installation, vCenter administration, networking, HA/DRS clustering, and disaster recovery.'
      },
      powershell: {
        title: 'PowerShell Training',
        duration: '2 Months · Online / Classroom',
        summary: 'Automate Windows Server, Active Directory, VMware PowerCLI, and cloud infrastructure operations with modular PowerShell scripting.'
      },
      winserver: {
        title: 'Windows Server Training',
        duration: '2 Months · Online / Classroom',
        summary: 'Enterprise administration of Active Directory, Group Policy, DNS, DHCP, Hyper-V virtualization, Failover Clustering, and security hardening.'
      }
    };

    root.querySelectorAll('[data-program-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-program-id');
        var prog = programDetails[key];
        if (!prog || !infoTitleEl || !infoBodyEl) return;

        infoTitleEl.textContent = prog.title;
        infoBodyEl.innerHTML =
          '<p><strong>Format:</strong> ' + prog.duration + '</p>' +
          '<p>' + prog.summary + '</p>' +
          '<ul class="lp-modal-list">' +
          '<li>Live interactive sessions led by industry practitioners</li>' +
          '<li>1:1 mentorship, practical assignments &amp; lifetime LMS access</li>' +
          '<li>Paid internship &amp; dedicated placement assistance</li>' +
          '</ul>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
          '<button type="button" class="lp-btn lp-btn-primary" style="flex:1" data-prog-syllabus>Download Syllabus</button>' +
          '<button type="button" class="lp-btn lp-btn-outline" style="flex:1" data-prog-callback>Request Call Back</button>' +
          '</div>';

        var sylBtn = infoBodyEl.querySelector('[data-prog-syllabus]');
        if (sylBtn) {
          sylBtn.addEventListener('click', function () {
            var courseInput = root.querySelector('#lp-syl-course');
            var modalHeading = root.querySelector('#lp-syl-modal-title');
            if (courseInput) courseInput.value = prog.title;
            if (modalHeading) modalHeading.textContent = 'Download Syllabus — ' + prog.title;
            openModal(syllabusModal);
          });
        }

        var cbBtn = infoBodyEl.querySelector('[data-prog-callback]');
        if (cbBtn) {
          cbBtn.addEventListener('click', function () {
            openModal(callbackModal);
          });
        }

        openModal(infoModal);
      });
    });

    /* Generic Info Modal Triggers (Blogs, Corporate Training, Hire From Us, Policies) */
    var infoTopics = {
      blogs: {
        title: 'Learningsport Tech Blogs',
        body: '<p>Explore practical tutorials, VMware vSphere architecture deep-dives, AWS DevOps guides, and career transition stories curated by our faculty.</p><p>Subscribe or speak with an advisor to receive weekly cloud engineering study notes.</p>'
      },
      hire: {
        title: 'Hire Pre-Trained Cloud & Virtualization Talent',
        body: '<p>Partner with Learningsport Technologies to hire job-ready VMware, AWS, DevOps, and Windows Server engineers trained on real-world production scenarios.</p><p>Contact our placement cell at <strong>Info@learningport.tech</strong> or <strong>+91 97428 54447</strong>.</p>'
      },
      about: {
        title: 'About Learningsport Technologies',
        body: '<p>Learningsport Technologies provides industry-aligned cloud, virtualization, DevOps, and full-stack training programs with 1:1 mentorship, paid internships, and dedicated placement support across Bengaluru and Raichur.</p>'
      },
      corporate: {
        title: 'Corporate Training Programs',
        body: '<p>Upskill your engineering teams with customized VMware vSphere, AWS, Azure, PowerShell, and DevOps workshops tailored to your enterprise infrastructure stack.</p>'
      },
      terms: {
        title: 'Terms & Conditions',
        body: '<p>Enrollment in Learningsport Technologies certification programs grants lifetime LMS access to course recordings, lab guides, and community mentorship channels subject to standard academic integrity guidelines.</p>'
      },
      privacy: {
        title: 'Privacy Policy',
        body: '<p>Your contact details submitted via enquiry or syllabus download forms are used solely by Learningsport Technologies academic advisors to share program details and placement assistance.</p>'
      },
      refund: {
        title: 'Refund Policy',
        body: '<p>Learners may request batch transfers or fee adjustments in accordance with Learningsport Technologies enrollment guidelines. Reach out to Info@learningport.tech for assistance.</p>'
      }
    };

    root.querySelectorAll('[data-info-topic]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var key = link.getAttribute('data-info-topic');
        var topic = infoTopics[key];
        if (!topic || !infoTitleEl || !infoBodyEl) return;

        infoTitleEl.textContent = topic.title;
        infoBodyEl.innerHTML =
          topic.body +
          '<div style="margin-top:16px"><button type="button" class="lp-btn lp-btn-primary" style="width:100%" data-topic-cb>Connect With Us</button></div>';

        var btn = infoBodyEl.querySelector('[data-topic-cb]');
        if (btn) {
          btn.addEventListener('click', function () {
            openModal(callbackModal);
          });
        }
        openModal(infoModal);
      });
    });

    /* Close Modal Handlers */
    root.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', closeAllModals);
    });

    [callbackModal, syllabusModal, infoModal].forEach(function (modal) {
      if (!modal) return;
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllDropdowns(null);
        closeAllModals();
      }
    });

    /* ========================================================================
       5. FORM VALIDATION & SUBMISSION HANDLERS
       ======================================================================== */
    function isValidEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    }

    function isValidPhone(val) {
      var digits = val.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15;
    }

    function clearInvalid(form) {
      form.querySelectorAll('.is-invalid').forEach(function (el) {
        el.classList.remove('is-invalid');
      });
    }

    function setSubmitting(form, isBusy, busyLabel, defaultLabel) {
      var btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      btn.disabled = isBusy;
      btn.textContent = isBusy ? busyLabel : defaultLabel;
    }

    function saveAppointment(payload) {
      return fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            if (!res.ok) {
              throw new Error(data.error || 'Failed to save appointment details.');
            }
            return data;
          });
      });
    }

    /* Meridian Course Enquiry Form (WhatsApp Redirect) */
    (function initMeridianEnquiry() {
      var form = document.getElementById('me-enquiry-form');
      if (!form || form.dataset.initialized === 'true') return;
      form.dataset.initialized = 'true';

      var button = document.getElementById('me-submit');
      var whatsappNumber = '916371126371';
      var isSubmitting = false;

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;
        if (!form.reportValidity()) return;

        isSubmitting = true;
        if (button) {
          button.disabled = true;
          button.textContent = 'Redirecting to WhatsApp...';
        }

        var name = document.getElementById('me-name').value.trim();
        var mobile = document.getElementById('me-mobile').value.trim();
        var email = document.getElementById('me-email').value.trim();
        var program = document.getElementById('me-program').value;
        var mode = document.getElementById('me-mode').value;
        var message = document.getElementById('me-message').value.trim();

        var referenceId = 'ENQ-' + Math.random().toString(16).substring(2, 10).toUpperCase();

        var whatsappMessage =
          'Hello Meridian Tech Institute!\n\n' +
          'I would like to enquire about your training programs.\n\n' +
          'ENQUIRY DETAILS\n' +
          '--------------------------------\n' +
          'Reference ID: ' + referenceId + '\n' +
          'Full Name: ' + name + '\n' +
          'Mobile Number: ' + mobile + '\n' +
          'Email Address: ' + email + '\n' +
          'Interested Program: ' + program + '\n' +
          'Preferred Learning Mode: ' + mode + '\n' +
          'Message: ' + (message || 'Not provided') + '\n' +
          '--------------------------------\n\n' +
          'Please share the course details, fees, curriculum, ' +
          'and upcoming batch information.\n\n' +
          'Thank you!';

        var whatsappURL =
          'https://api.whatsapp.com/send?phone=' +
          whatsappNumber +
          '&text=' +
          encodeURIComponent(whatsappMessage);

        window.location.assign(whatsappURL);
      });
    })();

    /* Request Call Back Modal Form */
    var cbForm = root.querySelector('#lp-callback-form');
    var cbFeedback = root.querySelector('#lp-cb-feedback');

    if (cbForm && cbFeedback) {
      cbForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearInvalid(cbForm);

        var name = cbForm.querySelector('#lp-cb-name');
        var phone = cbForm.querySelector('#lp-cb-phone');
        var email = cbForm.querySelector('#lp-cb-email');

        if (!name.value.trim() || !isValidPhone(phone.value) || !isValidEmail(email.value)) {
          if (!name.value.trim()) name.classList.add('is-invalid');
          if (!isValidPhone(phone.value)) phone.classList.add('is-invalid');
          if (!isValidEmail(email.value)) email.classList.add('is-invalid');
          cbFeedback.className = 'lp-form-feedback is-error';
          cbFeedback.textContent = 'Please enter your name, a valid 10-digit phone number, and email.';
          return;
        }

        var phoneVal = phone.value.trim();
        cbFeedback.className = 'lp-form-feedback';
        cbFeedback.textContent = '';
        setSubmitting(cbForm, true, 'Saving Request...', 'Request Call Back');

        saveAppointment({
          fullName: name.value.trim(),
          phone: phoneVal,
          email: email.value.trim(),
          course: 'VMware Certification Master Program',
          source: 'callback_request',
        })
          .then(function () {
            cbFeedback.className = 'lp-form-feedback is-success';
            cbFeedback.textContent =
              'Call back scheduled! Your details are saved and an academic counselor will call ' +
              phoneVal +
              ' soon.';
            cbForm.reset();
          })
          .catch(function (err) {
            cbFeedback.className = 'lp-form-feedback is-error';
            cbFeedback.textContent = err.message || 'Could not save your callback request.';
          })
          .finally(function () {
            setSubmitting(cbForm, false, 'Saving Request...', 'Request Call Back');
          });
      });
    }

    /* Download Syllabus Modal Form + Real File Download */
    var sylForm = root.querySelector('#lp-syllabus-form');
    var sylFeedback = root.querySelector('#lp-syl-feedback');

    if (sylForm && sylFeedback) {
      sylForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearInvalid(sylForm);

        var name = sylForm.querySelector('#lp-syl-name');
        var phone = sylForm.querySelector('#lp-syl-phone');
        var email = sylForm.querySelector('#lp-syl-email');
        var course = sylForm.querySelector('#lp-syl-course');

        if (!name.value.trim() || !isValidPhone(phone.value) || !isValidEmail(email.value)) {
          if (!name.value.trim()) name.classList.add('is-invalid');
          if (!isValidPhone(phone.value)) phone.classList.add('is-invalid');
          if (!isValidEmail(email.value)) email.classList.add('is-invalid');
          sylFeedback.className = 'lp-form-feedback is-error';
          sylFeedback.textContent = 'Please complete all required fields to download the syllabus.';
          return;
        }

        var selectedCourse = (course && course.value) || 'VMware Certification Master Program';
        var emailVal = email.value.trim();
        var nameVal = name.value.trim();

        sylFeedback.className = 'lp-form-feedback';
        sylFeedback.textContent = '';
        setSubmitting(sylForm, true, 'Preparing Syllabus...', 'Download Syllabus Now');

        saveAppointment({
          fullName: nameVal,
          phone: phone.value.trim(),
          email: emailVal,
          course: selectedCourse,
          source: 'syllabus_download',
        })
          .then(function () {
            var syllabusContent =
              'LEARNINGSPORT TECHNOLOGIES — COURSE SYLLABUS\n' +
              'Program: ' + selectedCourse + '\n' +
              'Prepared for: ' + nameVal + ' (' + emailVal + ')\n\n' +
              'CURRICULUM MODULES:\n' +
              'Module 1: Introduction to VMware & Virtualization\n' +
              'Module 2: VMware vSphere Architecture\n' +
              'Module 3: Installation & Configuration of VMware\n' +
              'Module 4: Virtual Machines (VMs) Management\n' +
              'Module 5: Networking in VMware\n' +
              'Module 6: Azure Storage Solutions\n' +
              'Module 7: VMware High Availability & Fault Tolerance\n' +
              'Module 8: VMware Clustering & Resource Management\n' +
              'Module 9: Security & Access Control\n' +
              'Module 10: VMware Backup & Disaster Recovery\n' +
              'Module 11: VMware Automation & Scripting\n' +
              'Module 12: Monitoring & Performance Tuning\n' +
              'Module 13: Capstone Project - End-to-End VMware Deployment\n\n' +
              'Contact: +91 97428 54447 | Info@learningport.tech\n' +
              '66, 11th Main Rd, KEB Colony, 1st Stage, BTM Layout, Bengaluru, Karnataka 560029\n';

            try {
              var blob = new Blob([syllabusContent], { type: 'text/plain;charset=utf-8' });
              var url = URL.createObjectURL(blob);
              var dl = document.createElement('a');
              dl.href = url;
              dl.download = selectedCourse.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-syllabus.txt';
              document.body.appendChild(dl);
              dl.click();
              document.body.removeChild(dl);
              URL.revokeObjectURL(url);
            } catch (err) {
              /* Fallback confirmation only if Blob download is blocked */
            }

            sylFeedback.className = 'lp-form-feedback is-success';
            sylFeedback.textContent =
              'Your syllabus for ' + selectedCourse + ' is downloading now and your enquiry has been saved.';
            sylForm.reset();
            if (course) course.value = selectedCourse;
          })
          .catch(function (err) {
            sylFeedback.className = 'lp-form-feedback is-error';
            sylFeedback.textContent = err.message || 'Could not process syllabus request.';
          })
          .finally(function () {
            setSubmitting(sylForm, false, 'Preparing Syllabus...', 'Download Syllabus Now');
          });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLearningsportSite);
  } else {
    initLearningsportSite();
  }
})();
