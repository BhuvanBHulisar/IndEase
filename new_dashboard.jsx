  // --- VIEW 3: UNIFIED MODERN DASHBOARD ---
  if (view === 'dashboard') {
    const renderContent = () => {
      if (role === 'consumer') {
        switch (activeTab) {
          case 'fleet':
            return (
              <FleetView
                machines={machines}
                earningsStats={earningsStats}
                chartData={chartData}
                avgContinuity={avgContinuity}
                setShowAddMachineModal={setShowAddMachineModal}
                onDecommission={handleDeleteMachine}
              />
            );
          case 'messages':
            return (
              <MessagesView
                chats={chats}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                chatHistory={messages}
                onSendMessage={handleSendMessage}
                currentUser={{ id: 'user', name: firstName }}
              />
            );
          case 'history':
            return (
              <HistoryView
                serviceHistory={transactionHistory}
                onDownloadReport={handleDownloadReport}
                onViewReport={(item) => { setSelectedReport(item); setShowReportModal(true); }}
              />
            );
          case 'legacy':
            return (
              <LegacySearchView
                results={legacyResults}
                onSearch={handleLegacySearch}
                onRequestSpecs={handleRequestSpecs}
              />
            );
          case 'profile':
            return (
              <ProfileView
                user={{ firstName, lastName, extraInfo, phone, taxId, userPhoto }}
                isEditing={isEditingProfile}
                setIsEditing={setIsEditingProfile}
                onSave={handleSaveConsumerProfile}
                onPhotoUpload={handlePhotoUpload}
                onStartCamera={startCamera}
                onDeleteIdentity={() => setShowDeleteModal(true)}
              />
            );
          case 'help':
            return <SupportView onSubmitTicket={handleSubmitSupportTicket} />;
          case 'settings':
            return (
              <SettingsView
                is2FA={isTwoFactorEnabled}
                set2FA={setIsTwoFactorEnabled}
                visibility={profileVisibility}
                setVisibility={setProfileVisibility}
                onDeleteAccount={() => setShowDeleteModal(true)}
              />
            );
          default:
            return <FleetView machines={machines} earningsStats={earningsStats} chartData={chartData} avgContinuity={avgContinuity} setShowAddMachineModal={setShowAddMachineModal} onDecommission={handleDeleteMachine} />;
        }
      } else {
        // Producer views
        switch (activeTab) {
          case 'requests':
            return (
              <ProducerDashboard
                stats={producerDashStats}
                radarJobs={radarJobs}
                user={{ firstName, lastName, photo: userPhoto, id: profileData.id }}
                onAcceptJob={handleAcceptJob}
                onViewDetails={() => {}}
              />
            );
          case 'pro-messages':
            return (
                <MessagesView
                  chats={producerChats}
                  activeChatId={activeChatId}
                  setActiveChatId={setActiveChatId}
                  chatHistory={messages}
                  onSendMessage={handleSendMessage}
                  currentUser={{ id: 'expert', name: firstName }}
                />
              );
          case 'earnings':
          case 'history':
            return (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue (INR)</p>
                    <h3 className="text-4xl font-extrabold text-slate-900">₹{producerDashStats.earnings.toLocaleString()}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jobs Completed</p>
                    <h3 className="text-4xl font-extrabold text-slate-900">{producerDashStats.completedJobs}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expert Rating</p>
                    <h3 className="text-4xl font-extrabold text-slate-900">{producerDashStats.rating.toFixed(1)}/5.0</h3>
                  </div>
                </div>
                <HistoryView serviceHistory={transactionHistory} onDownloadReport={handleDownloadReport} onViewReport={(item) => { setSelectedReport(item); setShowReportModal(true); }} />
              </div>
            );
          case 'profile':
              return (
                <ProfileView
                  user={{ 
                    firstName: profileData.name ? profileData.name.split(' ')[0] : firstName, 
                    lastName: profileData.name ? (profileData.name.split(' ')[1] || '') : lastName, 
                    extraInfo: profileData.role, 
                    phone: profileData.phone, 
                    taxId: profileData.id, 
                    userPhoto: userPhoto 
                  }}
                  isEditing={isEditingProfile}
                  setIsEditing={setIsEditingProfile}
                  onSave={handleSaveConsumerProfile}
                  onPhotoUpload={handlePhotoUpload}
                  onStartCamera={startCamera}
                  onDeleteIdentity={() => setShowDeleteModal(true)}
                  isProducer={true}
                />
              );
          case 'help':
          case 'support':
              return <SupportView onSubmitTicket={handleSubmitSupportTicket} />;
          case 'platform-settings':
          case 'settings':
              return (
                <SettingsView
                  is2FA={isTwoFactorEnabled}
                  set2FA={setIsTwoFactorEnabled}
                  visibility={profileVisibility}
                  setVisibility={setProfileVisibility}
                  onDeleteAccount={() => setShowDeleteModal(true)}
                />
              );
          default:
            return <ProducerDashboard stats={producerDashStats} radarJobs={radarJobs} user={{ firstName, lastName, photo: userPhoto, id: profileData.id }} onAcceptJob={handleAcceptJob} />;
        }
      }
    };

    return (
      <DashboardLayout
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={{ firstName, lastName, photo: userPhoto, email }}
        notifications={notifications}
        onLogout={handleLogout}
        onClearNotifs={handleClearNotifs}
      >
        <div className="animate-fade-in">
          {renderContent()}
        </div>
        {sharedModals}
      </DashboardLayout>
    );
  }
